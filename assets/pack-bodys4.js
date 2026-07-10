(function () {
  function transformShopifyProduct(product) {
    var firstImage = product.images && product.images.length ? product.images[0].src : "";
    var variants = (product.variants || []).map(function (variant) {
      var options = [variant.option1, variant.option2, variant.option3].filter(function (value) {
        return value !== null && value !== undefined && value !== "";
      });

      return {
        id: variant.id,
        title: variant.title,
        available: variant.available,
        image: variant.featured_image && variant.featured_image.src ? variant.featured_image.src : "",
        options: options
      };
    });

    return {
      id: product.id,
      handle: product.handle,
      name: product.title,
      img: firstImage,
      available: product.available,
      is_variable: variants.length > 1,
      default_variant_id: variants[0] ? variants[0].id : null,
      variants: variants,
      options: (product.options || []).map(function (option) {
        return {
          name: option.name,
          values: option.values
        };
      })
    };
  }

  function fetchCollectionProducts(handle, limit) {
    var collected = [];
    var page = 1;

    function fetchPage() {
      var remaining = limit - collected.length;
      var requestLimit = remaining > 250 ? 250 : remaining;

      return fetch(
        "/collections/" + encodeURIComponent(handle) + "/products.json?limit=" + requestLimit + "&page=" + page
      )
        .then(function (response) {
          if (!response.ok) {
            throw new Error("No se pudieron cargar mas productos.");
          }
          return response.json();
        })
        .then(function (data) {
          if (!data.products || !data.products.length) {
            return collected;
          }

          data.products.forEach(function (product) {
            collected.push(transformShopifyProduct(product));
          });

          if (collected.length >= limit || data.products.length < requestLimit) {
            return collected.slice(0, limit);
          }

          page += 1;
          return fetchPage();
        });
    }

    return fetchPage();
  }

  function initPackUI(section) {
    if (!section || section.dataset.initialized === "true" || section.dataset.empty === "true") {
      return;
    }

    section.dataset.initialized = "true";

    var productsNode = section.querySelector("[data-pack-products]");
    if (!productsNode) {
      return;
    }

    var messageNode = section.querySelector("[data-pack-message]");

    function showInitMessage(text) {
      if (!messageNode) {
        return;
      }

      messageNode.hidden = false;
      messageNode.textContent = text;
      messageNode.classList.add("pack-ui__message--error");
    }

    var products = [];
    var productsLimit = Number(section.dataset.productsLimit || 50);
    var collectionHandle = section.dataset.collectionHandle || "";

    try {
      products = JSON.parse(productsNode.textContent).filter(function (product) {
        return Boolean(product.default_variant_id);
      });
    } catch (error) {
      console.error("Pack Bodys 4: no se pudo leer el catalogo de productos.", error);
      showInitMessage("No se pudieron cargar los productos del pack. Recarga la pagina o revisa la seccion.");
      return;
    }

    function bootstrapPackUI() {
      products = products.filter(function (product) {
        return Boolean(product.default_variant_id);
      });

      if (!products.length && productsLimit > 0) {
        showInitMessage("No hay productos disponibles en esta coleccion.");
      }
    var slotCount = Number(section.dataset.slotCount || 4);
    var cartUrl = section.dataset.cartUrl || "/cart/add.js";
    var checkoutUrl = section.dataset.checkoutUrl || "/checkout";
    var buyButton = section.querySelector(".pack-button--buy");
    var resetButton = section.querySelector(".pack-button--reset");
    var slots = Array.prototype.slice.call(section.querySelectorAll(".slot"));
    var productsModal = section.querySelector("[data-pack-modal]");
    var variantsModal = section.querySelector("[data-variant-modal]");
    var productsGrid = section.querySelector("[data-products-grid]");
    var paginationNode = section.querySelector("[data-pagination]");
    var variantContent = section.querySelector("[data-variant-content]");

    var currentState = {
      currentSlot: null,
      selected: {},
      currentPage: 1,
      perPage: 20,
      currentProduct: null
    };

    function showMessage(text, isError) {
      if (!messageNode) {
        return;
      }

      messageNode.hidden = !text;
      messageNode.textContent = text || "";
      messageNode.classList.toggle("pack-ui__message--error", Boolean(text && isError));
      messageNode.classList.toggle("pack-ui__message--success", Boolean(text && !isError));
    }

    function openModal(modal) {
      modal.hidden = false;
      document.body.classList.add("pack-modal-open");
    }

    function closeModal(modal) {
      modal.hidden = true;
      if (productsModal.hidden && variantsModal.hidden) {
        document.body.classList.remove("pack-modal-open");
      }
    }

    function isSelectedProduct(product) {
      return Object.keys(currentState.selected).some(function (slot) {
        var entry = currentState.selected[slot];
        if (typeof entry === "object") {
          return entry.product_id === product.id;
        }
        return entry === product.default_variant_id;
      });
    }

    function renderProducts() {
      if (!products.length) {
        productsGrid.innerHTML = '<p class="pack-ui__empty">No hay productos disponibles en esta coleccion.</p>';
        paginationNode.innerHTML = "";
        return;
      }

      var start = (currentState.currentPage - 1) * currentState.perPage;
      var items = products.slice(start, start + currentState.perPage);

      productsGrid.innerHTML = items.map(function (product) {
        var selectedClass = isSelectedProduct(product) ? " prod--selected" : "";
        var imageMarkup = product.img ? '<img src="' + product.img + '" alt="' + product.name + '">' : '<div class="prod__placeholder">Sin imagen</div>';
        return (
          '<button type="button" class="prod' +
          selectedClass +
          '" data-product-id="' +
          product.id +
          '">' +
          imageMarkup +
          "<p>" +
          product.name +
          "</p></button>"
        );
      }).join("");

      var totalPages = Math.max(1, Math.ceil(products.length / currentState.perPage));
      paginationNode.innerHTML =
        '<button type="button" class="pack-page-button" data-page="prev"' +
        (currentState.currentPage === 1 ? " disabled" : "") +
        ">Anterior</button>" +
        "<span>Pagina " +
        currentState.currentPage +
        " de " +
        totalPages +
        "</span>" +
        '<button type="button" class="pack-page-button" data-page="next"' +
        (currentState.currentPage === totalPages ? " disabled" : "") +
        ">Siguiente</button>";
    }

    function fillSlot(slotNode, image, alt) {
      slotNode.innerHTML = image
        ? '<img src="' + image + '" alt="' + (alt || "Producto seleccionado") + '">'
        : '<span class="slot__plus">+</span>';
      slotNode.classList.toggle("slot--filled", Boolean(image));
    }

    function resetSelections() {
      currentState.selected = {};
      slots.forEach(function (slot) {
        fillSlot(slot, null);
      });
      showMessage("", false);
    }

    function chooseSimpleProduct(product) {
      if (!product.default_variant_id) {
        showMessage("Este producto no tiene una variante disponible.", true);
        return;
      }

      if (!product.available) {
        showMessage("Este producto no esta disponible.", true);
        return;
      }
      fillSlot(currentState.currentSlot, product.img, product.name);
      currentState.selected[currentState.currentSlot.dataset.slot] = product.default_variant_id;
      closeModal(productsModal);
    }

    function findMatchingVariant(product, chosenValues) {
      return product.variants.find(function (variant) {
        return chosenValues.every(function (value, index) {
          return variant.options[index] === value;
        });
      });
    }

    function renderVariantPicker(product) {
      currentState.currentProduct = product;

      var optionMarkup = product.options.map(function (option, index) {
        var options = option.values.map(function (value) {
          return '<option value="' + value + '">' + value + "</option>";
        }).join("");

        return (
          '<label class="variant-picker__label">' +
          option.name +
          '<select class="variant-picker__select" data-option-index="' +
          index +
          '">' +
          options +
          "</select></label>"
        );
      }).join("");

      variantContent.innerHTML =
        '<div class="variant-picker">' +
        (product.img ? '<img class="variant-picker__image" data-variant-preview src="' + product.img + '" alt="' + product.name + '">' : "") +
        "<h3>" +
        product.name +
        "</h3>" +
        optionMarkup +
        '<button type="button" class="pack-button pack-button--buy" data-select-variant>Seleccionar</button>' +
        "</div>";

      updateVariantPreview();
      openModal(variantsModal);
    }

    function updateVariantPreview() {
      if (!currentState.currentProduct) {
        return;
      }

      var selects = Array.prototype.slice.call(variantContent.querySelectorAll(".variant-picker__select"));
      var chosenValues = selects.map(function (select) {
        return select.value;
      });
      var variant = findMatchingVariant(currentState.currentProduct, chosenValues);
      var preview = variantContent.querySelector("[data-variant-preview]");
      var button = variantContent.querySelector("[data-select-variant]");

      if (!variant) {
        if (button) {
          button.disabled = true;
        }
        return;
      }

      if (preview && variant.image) {
        preview.src = variant.image;
      }

      if (button) {
        button.disabled = !variant.available;
        button.textContent = variant.available ? "Seleccionar" : "Agotado";
      }
    }

    function chooseVariant() {
      var selects = Array.prototype.slice.call(variantContent.querySelectorAll(".variant-picker__select"));
      var chosenValues = selects.map(function (select) {
        return select.value;
      });
      var variant = findMatchingVariant(currentState.currentProduct, chosenValues);

      if (!variant) {
        showMessage("No existe esa combinacion.", true);
        return;
      }

      if (!variant.available) {
        showMessage("La variante seleccionada no esta disponible.", true);
        return;
      }

      currentState.selected[currentState.currentSlot.dataset.slot] = {
        product_id: currentState.currentProduct.id,
        variant_id: variant.id
      };
      fillSlot(currentState.currentSlot, variant.image || currentState.currentProduct.img, currentState.currentProduct.name);
      closeModal(variantsModal);
      closeModal(productsModal);
      showMessage("", false);
    }

    function validateSelection() {
      var ids = Object.keys(currentState.selected).sort().map(function (key) {
        return currentState.selected[key];
      });

      if (ids.length !== slotCount) {
        showMessage("Debes seleccionar " + slotCount + " productos.", true);
        return null;
      }

      return ids.map(function (entry) {
        return {
          id: typeof entry === "object" ? entry.variant_id : entry,
          quantity: 1
        };
      });
    }

    function addPackToCart() {
      var items = validateSelection();
      if (!items) {
        return;
      }

      buyButton.disabled = true;
      buyButton.textContent = section.dataset.buttonLoadingText || "Procesando...";
      showMessage("", false);

      fetch(cartUrl + ".js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ items: items })
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("No se pudo agregar el pack al carrito.");
          }
          return response.json();
        })
        .then(function () {
          window.location.href = checkoutUrl;
        })
        .catch(function (error) {
          showMessage(error.message, true);
        })
        .finally(function () {
          buyButton.disabled = false;
          buyButton.textContent = section.dataset.buttonDefaultText || "Comprar ahora";
        });
    }

    slots.forEach(function (slot) {
      slot.addEventListener("click", function () {
        currentState.currentSlot = slot;
        renderProducts();
        openModal(productsModal);
      });
    });

    productsModal.addEventListener("click", function (event) {
      if (event.target === productsModal || event.target.closest("[data-close-products]")) {
        closeModal(productsModal);
      }

      var productButton = event.target.closest(".prod");
      if (!productButton) {
        return;
      }

      var product = products.find(function (item) {
        return String(item.id) === productButton.dataset.productId;
      });

      if (!product) {
        return;
      }

      if (product.is_variable) {
        renderVariantPicker(product);
      } else {
        chooseSimpleProduct(product);
      }
    });

    variantsModal.addEventListener("click", function (event) {
      if (event.target === variantsModal || event.target.closest("[data-close-variants]")) {
        closeModal(variantsModal);
      }

      if (event.target.closest("[data-select-variant]")) {
        chooseVariant();
      }
    });

    paginationNode.addEventListener("click", function (event) {
      var pageButton = event.target.closest("[data-page]");
      if (!pageButton) {
        return;
      }

      var totalPages = Math.max(1, Math.ceil(products.length / currentState.perPage));
      if (pageButton.dataset.page === "next" && currentState.currentPage < totalPages) {
        currentState.currentPage += 1;
      }
      if (pageButton.dataset.page === "prev" && currentState.currentPage > 1) {
        currentState.currentPage -= 1;
      }
      renderProducts();
    });

    variantContent.addEventListener("change", function (event) {
      if (event.target.matches(".variant-picker__select")) {
        updateVariantPreview();
      }
    });

    resetButton.addEventListener("click", resetSelections);
    buyButton.addEventListener("click", addPackToCart);
    }

    if (collectionHandle && productsLimit > products.length) {
      fetchCollectionProducts(collectionHandle, productsLimit)
        .then(function (fetchedProducts) {
          if (fetchedProducts.length) {
            products = fetchedProducts;
          }
          bootstrapPackUI();
        })
        .catch(function (error) {
          console.error("Pack Bodys 4: error cargando productos extra.", error);
          bootstrapPackUI();
        });
      return;
    }

    bootstrapPackUI();
  }

  function initAllPackSections() {
    document.querySelectorAll('.pack-ui[data-pack-mode="variable"]').forEach(initPackUI);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllPackSections);
  } else {
    initAllPackSections();
  }

  document.addEventListener("shopify:section:load", function (event) {
    initPackUI(event.target.querySelector('.pack-ui[data-pack-mode="variable"]'));
  });
})();
