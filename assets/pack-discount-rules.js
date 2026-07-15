(function (global) {
  var rules = [];

  function toNumber(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback || 0;
  }

  function registerRules(newRules) {
    rules = (newRules || [])
      .filter(function (rule) {
        return rule && rule.enabled !== false;
      })
      .sort(function (a, b) {
        return toNumber(b.priority, 0) - toNumber(a.priority, 0);
      });
  }

  function getRules() {
    return rules.slice();
  }

  function countLineItems(lineItems) {
    return lineItems.reduce(function (sum, item) {
      return sum + toNumber(item.quantity, 1);
    }, 0);
  }

  function findMatchingTier(ranges, quantity) {
    var qty = toNumber(quantity, 0);
    var match = null;

    (ranges || []).forEach(function (tier) {
      var min = toNumber(tier.min, 0);
      var max = toNumber(tier.max, 999999);
      if (qty >= min && qty <= max) {
        match = tier;
      }
    });

    return match;
  }

  function matchesConditions(rule, context) {
    var conditions = rule.conditions || [];
    if (!conditions.length) {
      return true;
    }

    return conditions.every(function (condition) {
      if (!condition || !condition.type) {
        return true;
      }

      if (condition.type === "payment_method") {
        return String(context.paymentMethod || "") === String(condition.value || "");
      }

      if (condition.type === "min_quantity") {
        return context.totalQuantity >= toNumber(condition.value, 0);
      }

      if (condition.type === "product_in_cart") {
        var ids = condition.variant_ids || condition.product_ids || [];
        return ids.some(function (id) {
          return context.variantIds.indexOf(String(id)) !== -1;
        });
      }

      return true;
    });
  }

  function applyTierToUnitPrice(originalUnitPrice, tier) {
    if (!tier) {
      return originalUnitPrice;
    }

    var type = tier.type || "fixed_price_per_item";
    var value = toNumber(tier.value, 0);

    if (type === "fixed_price_per_item") {
      return value;
    }

    if (type === "percentage") {
      return Math.round(originalUnitPrice * (1 - value / 100));
    }

    if (type === "fixed_discount") {
      return Math.max(0, originalUnitPrice - value);
    }

    return originalUnitPrice;
  }

  function normalizeLineItem(item) {
    var quantity = toNumber(item.quantity, 1);
    var linePrice = toNumber(item.price, 0);
    var unitPrice = toNumber(item.unitPrice, 0);

    if (!unitPrice && quantity > 0) {
      unitPrice = Math.round(linePrice / quantity);
    }

    return {
      variantId: item.variantId,
      quantity: quantity,
      title: item.title || "",
      variantTitle: item.variantTitle || "",
      image: item.image || "",
      unitPrice: unitPrice,
      originalUnitPrice: unitPrice,
      price: unitPrice * quantity,
      compareAtUnitPrice: 0,
      tierLabel: ""
    };
  }

  function applyRules(lineItems, context) {
    context = context || {};
    var collectionHandle = String(context.collectionHandle || "").toLowerCase();
    var paymentMethod = context.paymentMethod || "cod";
    var normalized = (lineItems || []).map(normalizeLineItem);
    var variantIds = normalized.map(function (item) {
      return String(item.variantId);
    });
    var totalQuantity = countLineItems(normalized);
    var appliedRule = null;
    var appliedTier = null;

    var originalSubtotal = normalized.reduce(function (sum, item) {
      return sum + item.originalUnitPrice * item.quantity;
    }, 0);

    for (var index = 0; index < rules.length; index += 1) {
      var rule = rules[index];
      var filter = rule.filter || {};
      var ruleCollection = String(filter.collection || "").toLowerCase();

      if (ruleCollection && ruleCollection !== collectionHandle) {
        continue;
      }

      if (
        !matchesConditions(rule, {
          paymentMethod: paymentMethod,
          totalQuantity: totalQuantity,
          variantIds: variantIds,
          collectionHandle: collectionHandle
        })
      ) {
        continue;
      }

      var countMode = rule.count_mode || "filter_set";
      var tier = null;
      var updated = normalized;

      if (countMode === "individual_product") {
        updated = normalized.map(function (item) {
          var itemTier = findMatchingTier(rule.ranges, item.quantity);
          var unitPrice = applyTierToUnitPrice(item.originalUnitPrice, itemTier);
          return Object.assign({}, item, {
            unitPrice: unitPrice,
            price: unitPrice * item.quantity,
            compareAtUnitPrice: item.originalUnitPrice,
            tierLabel: itemTier ? itemTier.label || "" : ""
          });
        });
        tier = findMatchingTier(rule.ranges, totalQuantity);
      } else {
        tier = findMatchingTier(rule.ranges, totalQuantity);
        if (tier) {
          updated = normalized.map(function (item) {
            var unitPrice = applyTierToUnitPrice(item.originalUnitPrice, tier);
            return Object.assign({}, item, {
              unitPrice: unitPrice,
              price: unitPrice * item.quantity,
              compareAtUnitPrice: item.originalUnitPrice,
              tierLabel: tier.label || ""
            });
          });
        }
      }

      if (tier || countMode === "individual_product") {
        normalized = updated;
        appliedRule = rule;
        appliedTier = tier;
        if (rule.exclusive) {
          break;
        }
      }
    }

    var subtotal = normalized.reduce(function (sum, item) {
      return sum + item.price;
    }, 0);

    return {
      lineItems: normalized,
      originalSubtotal: originalSubtotal,
      subtotal: subtotal,
      discountTotal: Math.max(0, originalSubtotal - subtotal),
      appliedRule: appliedRule,
      appliedTier: appliedTier,
      totalQuantity: totalQuantity
    };
  }

  function initFromDocument() {
    var node = document.querySelector("[data-pack-discount-rules]");
    if (!node) {
      return;
    }

    try {
      registerRules(JSON.parse(node.textContent));
    } catch (error) {
      console.error("PackDiscountRules: no se pudieron leer las reglas.", error);
    }
  }

  global.PackDiscountRules = {
    registerRules: registerRules,
    getRules: getRules,
    applyRules: applyRules,
    initFromDocument: initFromDocument
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFromDocument);
  } else {
    initFromDocument();
  }

  document.addEventListener("shopify:section:load", initFromDocument);
})();
