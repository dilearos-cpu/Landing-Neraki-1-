(function () {
  function isSimpleShopifyProduct(product) {
    return !product.variants || product.variants.length <= 1;
  }

  function transformSimpleProduct(product) {
    if (!isSimpleShopifyProduct(product)) {
      return null;
    }

    var firstImage = product.images && product.images.length ? product.images[0].src : "";
    var variant = product.variants && product.variants[0] ? product.variants[0] : null;

    return {
      id: product.id,
      handle: product.handle,
      name: product.title,
      img: firstImage,
      available: product.available,
      default_variant_id: variant ? variant.id : null
    };
  }

  function fetchSimpleCollectionProducts(handle, limit) {
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
            var transformed = transformSimpleProduct(product);
            if (transformed && transformed.default_variant_id) {
              collected.push(transformed);
            }
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

  function initPackBasicas(section) {
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
      console.error("Pack Basicas: no se pudo leer el catalogo de productos.", error);
      showInitMessage("No se pudieron cargar los productos del pack. Recarga la pagina o revisa la seccion.");
      return;
    }

    function bootstrapPackUI() {
      products = products.filter(function (product) {
        return Boolean(product.default_variant_id);
      });

      if (!products.length && productsLimit > 0) {
        showInitMessage("No hay productos simples disponibles en esta coleccion.");
      }

      var slotCount = Number(section.dataset.slotCount || 4);
      var cartUrl = section.dataset.cartUrl || "/cart/add.js";
      var checkoutUrl = section.dataset.checkoutUrl || "/checkout";
      var buyButton = section.querySelector(".pack-button--buy");
      var resetButton = section.querySelector(".pack-button--reset");
      var slots = Array.prototype.slice.call(section.querySelectorAll(".slot"));
      var productsModal = section.querySelector("[data-pack-modal]");
      var productsGrid = section.querySelector("[data-products-grid]");
      var paginationNode = section.querySelector("[data-pagination]");
      var currentState = {
        currentSlot: null,
        selected: {},
        currentPage: 1,
        perPage: 20
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

      function openModal() {
        productsModal.hidden = false;
        document.body.classList.add("pack-modal-open");
      }

      function closeModal() {
        productsModal.hidden = true;
        document.body.classList.remove("pack-modal-open");
      }

      function isSelectedProduct(product) {
        return Object.keys(currentState.selected).some(function (slot) {
          return currentState.selected[slot] === product.default_variant_id;
        });
      }

      function renderProducts() {
        if (!products.length) {
          productsGrid.innerHTML = '<p class="pack-ui__empty">No hay productos simples en esta coleccion.</p>';
          paginationNode.innerHTML = "";
          return;
        }

        var start = (currentState.currentPage - 1) * currentState.perPage;
        var items = products.slice(start, start + currentState.perPage);

        productsGrid.innerHTML = items
          .map(function (product) {
            var selectedClass = isSelectedProduct(product) ? " prod--selected" : "";
            var imageMarkup = product.img
              ? '<img src="' + product.img + '" alt="' + product.name + '">'
              : '<div class="prod__placeholder">Sin imagen</div>';
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
          })
          .join("");

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

      function chooseProduct(product) {
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
        closeModal();
      }

      function validateSelection() {
        var ids = Object.keys(currentState.selected)
          .sort()
          .map(function (key) {
            return currentState.selected[key];
          });

        if (ids.length !== slotCount) {
          showMessage("Debes seleccionar " + slotCount + " productos.", true);
          return null;
        }

        return ids.map(function (variantId) {
          return {
            id: variantId,
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
          openModal();
        });
      });

      productsModal.addEventListener("click", function (event) {
        if (event.target === productsModal || event.target.closest("[data-close-products]")) {
          closeModal();
        }

        var productButton = event.target.closest(".prod");
        if (!productButton) {
          return;
        }

        var product = products.find(function (item) {
          return String(item.id) === productButton.dataset.productId;
        });

        if (product) {
          chooseProduct(product);
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

      resetButton.addEventListener("click", resetSelections);
      buyButton.addEventListener("click", addPackToCart);
    }

    if (collectionHandle && productsLimit > products.length) {
      fetchSimpleCollectionProducts(collectionHandle, productsLimit)
        .then(function (fetchedProducts) {
          if (fetchedProducts.length) {
            products = fetchedProducts;
          }
          bootstrapPackUI();
        })
        .catch(function (error) {
          console.error("Pack Basicas: error cargando productos extra.", error);
          bootstrapPackUI();
        });
      return;
    }

    bootstrapPackUI();
  }

  function initAllPackBasicas() {
    document.querySelectorAll('.pack-ui[data-pack-mode="simple"]').forEach(initPackBasicas);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllPackBasicas);
  } else {
    initAllPackBasicas();
  }

  document.addEventListener("shopify:section:load", function (event) {
    initPackBasicas(event.target.querySelector('.pack-ui[data-pack-mode="simple"]'));
  });
})();
