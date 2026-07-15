(function () {
  var SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "2XL", "3XL", "4XL"];

  function detectSizeOptionIndex(options) {
    if (!options || !options.length) {
      return -1;
    }

    for (var index = 0; index < options.length; index += 1) {
      var name = String(options[index].name || "").toLowerCase();
      if (name.indexOf("talla") !== -1 || name.indexOf("size") !== -1) {
        return index;
      }
    }

    return -1;
  }

  function sortSizes(sizes) {
    return sizes.slice().sort(function (a, b) {
      var aKey = String(a).toUpperCase();
      var bKey = String(b).toUpperCase();
      var aIndex = SIZE_ORDER.indexOf(aKey);
      var bIndex = SIZE_ORDER.indexOf(bKey);

      if (aIndex === -1 && bIndex === -1) {
        return String(a).localeCompare(String(b), "es", { numeric: true });
      }
      if (aIndex === -1) {
        return 1;
      }
      if (bIndex === -1) {
        return -1;
      }
      return aIndex - bIndex;
    });
  }

  function shuffle(items) {
    var array = items.slice();

    for (var i = array.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }

    return array;
  }

  function getVariantsForSize(product, sizeValue, sizeIndex) {
    if (sizeIndex === -1) {
      return (product.variants || []).filter(function (variant) {
        return variant.available;
      });
    }

    return (product.variants || []).filter(function (variant) {
      return variant.available && variant.options && variant.options[sizeIndex] === sizeValue;
    });
  }

  function buildSimpleSelections(products, slotCount) {
    var pool = products.filter(function (product) {
      return product.default_variant_id && product.available;
    });

    if (!pool.length) {
      return { error: "No hay productos disponibles para escoger." };
    }

    var shuffled = shuffle(pool);
    var selections = [];

    for (var i = 0; i < slotCount; i += 1) {
      var product = shuffled[i % shuffled.length];
      selections.push({
        slotIndex: i,
        variantId: product.default_variant_id,
        image: product.img,
        name: product.name
      });
    }

    return { selections: selections };
  }

  function buildVariableSelections(products, slotCount, sizeValue) {
    var sizeIndex = -1;

    products.some(function (product) {
      var index = detectSizeOptionIndex(product.options);
      if (index !== -1) {
        sizeIndex = index;
        return true;
      }
      return false;
    });

    if (sizeIndex !== -1 && !sizeValue) {
      return { error: "Selecciona una talla para continuar." };
    }

    var eligible = products.filter(function (product) {
      return getVariantsForSize(product, sizeValue, sizeIndex).length > 0;
    });

    if (!eligible.length) {
      return { error: "No hay productos disponibles para esa talla." };
    }

    var shuffled = shuffle(eligible);
    var selections = [];

    for (var i = 0; i < slotCount; i += 1) {
      var product = i < shuffled.length ? shuffled[i] : shuffled[Math.floor(Math.random() * shuffled.length)];
      var variants = getVariantsForSize(product, sizeValue, sizeIndex);
      var variant = variants[Math.floor(Math.random() * variants.length)];

      selections.push({
        slotIndex: i,
        productId: product.id,
        variantId: variant.id,
        image: variant.image || product.img,
        name: product.name
      });
    }

    return { selections: selections };
  }

  function getSizesFromProducts(products) {
    var seen = {};
    var sizes = [];

    products.forEach(function (product) {
      var sizeIndex = detectSizeOptionIndex(product.options);
      if (sizeIndex === -1) {
        return;
      }

      (product.variants || []).forEach(function (variant) {
        if (!variant.available) {
          return;
        }

        var sizeValue = variant.options && variant.options[sizeIndex];
        if (!sizeValue || seen[sizeValue]) {
          return;
        }

        seen[sizeValue] = true;
        sizes.push(sizeValue);
      });
    });

    return sizes;
  }

  function readPackProducts(packSection) {
    if (!packSection) {
      return [];
    }

    var productsNode = packSection.querySelector("[data-pack-products]");
    if (!productsNode) {
      return [];
    }

    try {
      return JSON.parse(productsNode.textContent).filter(function (product) {
        if (product.default_variant_id && product.available !== false) {
          return true;
        }

        return product.variants && product.variants.some(function (variant) {
          return variant.available;
        });
      });
    } catch (error) {
      return [];
    }
  }

  function createFallbackBuilder(packSection) {
    var packMode = packSection.dataset.packMode || "simple";

    return {
      packMode: packMode,
      packSection: packSection,
      getProducts: function () {
        if (window.PackPage && typeof window.PackPage.getPackBuilder === "function") {
          var registered = window.PackPage.getPackBuilder(packSection);
          if (registered && registered.getProducts().length) {
            return registered.getProducts();
          }
        }

        return readPackProducts(packSection);
      },
      getSlotCount: function () {
        if (window.PackPage && typeof window.PackPage.getPackBuilder === "function") {
          var registered = window.PackPage.getPackBuilder(packSection);
          if (registered) {
            return registered.getSlotCount();
          }
        }

        return Number(packSection.dataset.slotCount || 4);
      },
      getAvailableSizes: function () {
        var registered = getRegisteredBuilder(packSection);
        if (registered) {
          var registeredSizes = registered.getAvailableSizes();
          if (registeredSizes.length) {
            return registeredSizes;
          }
        }

        if (packMode === "variable") {
          return getSizesFromProducts(readPackProducts(packSection));
        }

        return [];
      },
      fillSelections: function (selections) {
        var registered = getRegisteredBuilder(packSection);
        if (registered && typeof registered.fillSelections === "function") {
          registered.fillSelections(selections);
          return;
        }

        throw new Error("Pack builder unavailable");
      },
      reset: function () {
        var registered = getRegisteredBuilder(packSection);
        if (registered && typeof registered.reset === "function") {
          registered.reset();
        }
      }
    };
  }

  function findPackForSection(section) {
    var preferredMode = section.dataset.packTarget || "";
    var normalizedMode = preferredMode === "basicas" ? "simple" : preferredMode === "bodys" ? "variable" : "";
    var pack = null;

    if (window.PackPage && typeof window.PackPage.getPackSectionForNode === "function") {
      pack = window.PackPage.getPackSectionForNode(section, normalizedMode);
    }

    if (!pack && normalizedMode === "variable") {
      pack = document.querySelector('.pack-ui[data-pack-kind="bodys"]:not([data-empty="true"])');
    }

    if (!pack && normalizedMode === "simple") {
      pack = document.querySelector('.pack-ui[data-pack-kind="basicas"]:not([data-empty="true"])');
    }

    if (!pack && window.PackPage && typeof window.PackPage.getPackSection === "function") {
      pack = window.PackPage.getPackSection();
    }

    return pack;
  }

  function getRegisteredBuilder(packSection) {
    if (!packSection || !window.PackPage || typeof window.PackPage.getPackBuilder !== "function") {
      return null;
    }

    return window.PackPage.getPackBuilder(packSection);
  }

  function waitForBuilder(section, attempts) {
    var packTarget = section.dataset.packTarget || "";
    var isBasicasTarget = packTarget === "basicas";
    var isBodysTarget = packTarget === "bodys";
    var pack = findPackForSection(section);
    var builder = pack ? getRegisteredBuilder(pack) : null;
    var jsonProducts = pack ? readPackProducts(pack) : [];
    var attempt = attempts || 0;

    if (builder && builder.getProducts().length) {
      return Promise.resolve(builder);
    }

    if (pack && jsonProducts.length) {
      var jsonFallbackDelay = isBasicasTarget ? 8 : isBodysTarget ? 0 : 2;
      if (attempt >= jsonFallbackDelay) {
        return Promise.resolve(createFallbackBuilder(pack));
      }
    }

    if (pack && attempt >= 80) {
      return Promise.resolve(builder || createFallbackBuilder(pack));
    }

    if (!pack && attempt >= 40) {
      return Promise.resolve(null);
    }

    return new Promise(function (resolve) {
      window.setTimeout(function () {
        resolve(waitForBuilder(section, attempt + 1));
      }, 150);
    });
  }

  function waitForRegisteredBuilder(packSection, attempts) {
    var registered = getRegisteredBuilder(packSection);
    var attempt = attempts || 0;

    if (registered && typeof registered.fillSelections === "function") {
      return Promise.resolve(registered);
    }

    if (attempt >= 40) {
      return Promise.resolve(null);
    }

    return new Promise(function (resolve) {
      window.setTimeout(function () {
        resolve(waitForRegisteredBuilder(packSection, attempt + 1));
      }, 150);
    });
  }

  function initPackAutoPick(section) {
    if (!section || section.dataset.initialized === "true") {
      return;
    }

    section.dataset.initialized = "true";

    var openButton = section.querySelector("[data-auto-pick-open]");
    var modal = section.querySelector("[data-auto-pick-modal]");
    var closeButton = section.querySelector("[data-auto-pick-close]");
    var sizesNode = section.querySelector("[data-auto-pick-sizes]");
    var noSizesNode = section.querySelector("[data-auto-pick-no-sizes]");
    var messageNode = section.querySelector("[data-auto-pick-message]");
    var confirmButton = section.querySelector("[data-auto-pick-confirm]");
    var selectedSize = "";
    var currentBuilder = null;

    if (!openButton || !modal || !confirmButton) {
      return;
    }

    function setMessage(text, type) {
      if (!messageNode) {
        return;
      }

      messageNode.hidden = !text;
      messageNode.textContent = text || "";
      messageNode.classList.toggle("pack-auto-pick__message--error", type === "error");
      messageNode.classList.toggle("pack-auto-pick__message--info", type === "info");
    }

    function openModal() {
      modal.hidden = false;
      document.body.classList.add("pack-modal-open");
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove("pack-modal-open");
      setMessage("", "");
    }

    function renderSizes(sizes) {
      if (!sizesNode) {
        return;
      }

      if (!sizes.length) {
        sizesNode.innerHTML = "";
        if (noSizesNode) {
          noSizesNode.hidden = false;
        }
        return;
      }

      if (noSizesNode) {
        noSizesNode.hidden = true;
      }

      sizesNode.innerHTML = sizes
        .map(function (size) {
          var activeClass = selectedSize === size ? " pack-auto-pick__size--active" : "";
          return (
            '<button type="button" class="pack-auto-pick__size' +
            activeClass +
            '" data-size-value="' +
            String(size).replace(/"/g, "&quot;") +
            '">' +
            size +
            "</button>"
          );
        })
        .join("");
    }

    function prepareModal() {
      setMessage("", "");
      selectedSize = "";
      confirmButton.disabled = true;
      setMessage("Cargando tallas del pack...", "info");

      return waitForBuilder(section).then(function (builder) {
        currentBuilder = builder;
        confirmButton.disabled = false;

        if (!builder) {
          setMessage(
            "No pudimos conectar con el pack de esta pagina. Recarga la pagina o revisa que Pack bodys o Pack basicas este activo.",
            "error"
          );
          renderSizes([]);
          return;
        }

        if (!builder.getProducts().length) {
          setMessage("El pack aun esta cargando productos. Intenta de nuevo en un momento.", "error");
          renderSizes([]);
          return;
        }

        if (section.dataset.packTarget === "basicas") {
          if (noSizesNode) {
            noSizesNode.hidden = false;
          }
        }

        var sizes = sortSizes(builder.getAvailableSizes());
        renderSizes(sizes);

        if (sizes.length) {
          selectedSize = sizes[Math.floor((sizes.length - 1) / 2)] || sizes[0];
          renderSizes(sizes);
          setMessage(section.dataset.sizeHint || "Selecciona tu talla y nosotros escogemos los diseños.", "info");
        } else {
          setMessage(
            section.dataset.noSizeHint ||
              "Escogeremos diseños al azar de la coleccion del pack.",
            "info"
          );
        }
      });
    }

    openButton.addEventListener("click", function () {
      openModal();
      prepareModal();
    });

    if (closeButton) {
      closeButton.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    if (sizesNode) {
      sizesNode.addEventListener("click", function (event) {
        var sizeButton = event.target.closest("[data-size-value]");
        if (!sizeButton) {
          return;
        }

        selectedSize = sizeButton.dataset.sizeValue || "";
        renderSizes(sortSizes(currentBuilder ? currentBuilder.getAvailableSizes() : []));
        setMessage("", "");
      });
    }

    confirmButton.addEventListener("click", function () {
      if (!currentBuilder) {
        setMessage("No hay un pack disponible para completar.", "error");
        return;
      }

      var products = currentBuilder.getProducts();
      var slotCount = currentBuilder.getSlotCount();
      var result =
        currentBuilder.packMode === "variable"
          ? buildVariableSelections(products, slotCount, selectedSize)
          : buildSimpleSelections(products, slotCount);

      if (result.error) {
        setMessage(result.error, "error");
        return;
      }

      confirmButton.disabled = true;
      setMessage("Aplicando seleccion al pack...", "info");

      waitForRegisteredBuilder(currentBuilder.packSection).then(function (activeBuilder) {
        if (!activeBuilder) {
          setMessage("El pack aun se esta cargando. Espera un momento e intenta de nuevo.", "error");
          confirmButton.disabled = false;
          return;
        }

        activeBuilder.fillSelections(result.selections);

        if (activeBuilder.packSection && window.PackPage && typeof window.PackPage.scrollToPack === "function") {
          window.PackPage.scrollToPack(activeBuilder.packSection);
        }

        closeModal();
        confirmButton.disabled = false;
      });
    });
  }

  function initAllPackAutoPick() {
    document.querySelectorAll(".pack-auto-pick").forEach(initPackAutoPick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllPackAutoPick);
  } else {
    initAllPackAutoPick();
  }

  document.addEventListener("shopify:section:load", function (event) {
    initPackAutoPick(event.target.querySelector(".pack-auto-pick"));
  });
})();
