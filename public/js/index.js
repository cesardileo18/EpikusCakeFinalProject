// ELIMINAR UN USUARIO DESDE EL FRONT

const deleteUser = document.querySelectorAll(".eliminar-usuario");
if (deleteUser) {
  deleteUser.forEach(button => {
    button.addEventListener("click", async () => {
      const userId = button.getAttribute("data-id");

      Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará al usuario.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then(async result => {
        if (result.isConfirmed) {
          try {
            const response = await fetch(`/api/users/${userId}`, {
              method: "DELETE",
            });

            if (response.ok) {
              Swal.fire({
                title: "Usuario eliminado",
                text: "El usuario ha sido eliminado con éxito.",
                icon: "success",
                confirmButtonColor: "#3085d6",
                timer: 3000,
                showConfirmButton: true,
              }).then(() => {
                location.reload();
              });
            } else {
              console.error("Error al eliminar el usuario.");
            }
          } catch (error) {
            console.error("Error de red:", error);
            Swal.fire({
              title: "Hubo un error",
              icon: "warning",
              confirmButtonText: "Aceptar",
              confirmButtonColor: "#000",
              onAfterClose: () => {
                window.location.href = "/home";
              },
              timer: 3000,
            });
            setTimeout(() => {
              window.location.href = "/home";
            }, 3000);
          }
        }
      });
    });
  });
}
// CAMBIAR ROL A UN USUARIO DESDE EL ROL
const editRoleButtons = document.querySelectorAll(".editar-rol");
if (editRoleButtons) {
  editRoleButtons.forEach(button => {
    button.addEventListener("click", async () => {
      const userId = button.getAttribute("data-id");

      Swal.fire({
        title: "¿Estás seguro de cambiar el rol del usuario?",
        text: "Esta acción cambiará el rol del usuario.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, cambiar rol",
        cancelButtonText: "Cancelar",
      }).then(async result => {
        if (result.isConfirmed) {
          try {
            const response = await fetch(`/api/users/role/${userId}`, {
              method: "GET",
            });

            if (response.ok) {
              Swal.fire({
                title: "Rol Actualizado.",
                text: "El usuario ha sido actualizado con éxito.",
                icon: "success",
                confirmButtonColor: "#3085d6",
                timer: 3000,
                showConfirmButton: true,
              }).then(() => {
                location.reload();
              });
            } else {
              console.error("Error al editar el usuario.");
            }
          } catch (error) {
            Swal.fire({
              title: "Hubo un error",
              icon: "warning",
              confirmButtonText: "Aceptar",
              confirmButtonColor: "#000",
              onAfterClose: () => {
                window.location.href = "/home";
              },
              timer: 3000,
            });
            setTimeout(() => {
              window.location.href = "/home";
            }, 3000);
            console.error("Error de red:", error);
          }
        }
      });
    });
  });
}
// CARRITO DE COMPRAS -----> AGREGAR AL CARRITO
document.addEventListener("DOMContentLoaded", () => {
  const addToCartButtons = document.querySelectorAll(".btnCart");
  const cartLink = document.getElementById("cartLink");
  const cartId = cartLink.getAttribute("href").split("/").pop();
  
  const userRole = document.getElementById("role").textContent;
  if (addToCartButtons) {
    addToCartButtons.forEach(button => {
      button.addEventListener("click", async () => {
        const productId = button.getAttribute("data-product-id");
        const productOwner = button.getAttribute("data-owner");
        const roleSpan = document.getElementById("role");
        const userSession = roleSpan.getAttribute("data-user");
        if (userRole) {
          if (userRole === "user" && productOwner === userSession) {
            Swal.fire({
              position: "center",
              icon: "error",
              title: "No puedes agregar productos que tu hayas creado.",
              showConfirmButton: true,
              confirmButtonColor: "#000",
              timer: 3000,
            });
          } else if (userRole === "admin" && productOwner === userSession) {
            Swal.fire({
              title: "Solo los usuarios pueden agregar Productos al Carrito",
              icon: "warning",
              confirmButtonText: "Aceptar",
              confirmButtonColor: "#000",
              onAfterClose: () => {
                window.location.href = "/home";
              },
              timer: 3000,
            });
            setTimeout(() => {
              window.location.href = "/home";
            }, 3000);
          }
          try {
            const response = await fetch(`/cart/${cartId}/products/${productId}`, {
              method: "POST",
            });

            if (response.ok) {
              if (userRole === "user") {
                Toastify({
                  text: "Producto Agregado al Carrito",
                  duration: 3000,
                  newWindow: true,
                  close: true,
                  gravity: "bottom",
                  position: "left",
                  stopOnFocus: true,
                  style: {
                    background: "#000",
                  },
                }).showToast();

                const cartQuantityElement = document.querySelector("#cartLink span");
                if (cartQuantityElement) {
                  const currentQuantity = parseInt(cartQuantityElement.innerText);
                  const newQuantity = currentQuantity + 1;
                  cartQuantityElement.innerText = newQuantity;
                }
              }
            } else {
              Swal.fire({
                title: "Solo los usuarios pueden agregar Productos al Carrito",
                icon: "warning",
                confirmButtonText: "Aceptar",
                confirmButtonColor: "#000",
                onAfterClose: () => {
                  window.location.href = "/home";
                },
                timer: 3000,
              });
              setTimeout(() => {
                window.location.href = "/home";
              }, 3000);
              console.error("Error al agregar el producto al carrito.");
            }
          } catch (error) {
            Swal.fire({
              title: "Solo los usuarios pueden agregar Productos al Carrito",
              icon: "warning",
              confirmButtonText: "Aceptar",
              confirmButtonColor: "#000",
              onAfterClose: () => {
                window.location.href = "/home";
              },
              timer: 3000,
            });
            setTimeout(() => {
              window.location.href = "/home";
            }, 3000);
            console.error("Error de red:", error);
          }
        }
      });
    });
  }
});

// CARRITO DE COMPRAS -----> AUMENTAR O DISMINUIR CANTIDAD EN FRONT
document.addEventListener("DOMContentLoaded", () => {
  const cartItems = document.querySelectorAll(".cartItem");
  const totalCartElement = document.querySelector(".totalCart span");
  function calcularSubtotal(cartItem) {
    const cantidadElement = cartItem.querySelector(".quant");
    const precioElement = cartItem.querySelector("#precio");
    const subtotalElement = cartItem.querySelector("#subtotal");

    const cantidad = parseFloat(cantidadElement.textContent);
    const precio = parseFloat(precioElement.textContent.replace("$ ", ""));

    const subtotal = cantidad * precio;
    subtotalElement.textContent = "$ " + subtotal;
  }
  function actualizarCantidad(cartItem, cantidad) {
    const cantidadElement = cartItem.querySelector(".quant");
    cantidadElement.textContent = cantidad.toString();
    calcularSubtotal(cartItem);
  }
  // CARRITO DE COMPRAS -----> AUMENTAR O DISMINUIR CANTIDAD EN BACKEND
  async function actualizarCantidadBackend(cartItem, cantidad) {
    const cartId = document.querySelector(".cartId").textContent;
    const productId = cartItem.querySelector(".butonDelete").getAttribute("data-product-id");
    try {
      const response = await fetch(`/cart/${cartId}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: cantidad }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedCart = data.cart;
        const cantidadElement = cartItem.querySelector(".quant");
        cantidadElement.textContent = cantidad;
        calcularSubtotal(cartItem);
        actualizarTotalCart();
      } else {
        console.error("Error al actualizar la cantidad del producto en el carrito");
      }
    } catch (error) {
      console.error("Error de red:", error);
      Swal.fire({
        title: "Hubo un error",
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#000",
        onAfterClose: () => {
          window.location.href = "/home";
        },
        timer: 3000,
      });
      setTimeout(() => {
        window.location.href = "/home";
      }, 3000);
    }
  }

  function botonIncrementarClick(event) {
    const cartItem = event.target.closest(".cartItem");
    const cantidadElement = cartItem.querySelector(".quant");
    let cantidad = parseFloat(cantidadElement.textContent);
    cantidad++;
    actualizarCantidad(cartItem, cantidad);
    actualizarCantidadBackend(cartItem, cantidad);
  }

  function botonDecrementarClick(event) {
    const cartItem = event.target.closest(".cartItem");
    const cantidadElement = cartItem.querySelector(".quant");
    let cantidad = parseFloat(cantidadElement.textContent);
    if (cantidad > 1) {
      cantidad--;
      actualizarCantidad(cartItem, cantidad);
      actualizarCantidadBackend(cartItem, cantidad);
    }
  }

  function actualizarTotalCart() {
    let total = 0;
    cartItems.forEach(cartItem => {
      const subtotalElement = cartItem.querySelector("#subtotal");
      const subtotal = parseFloat(subtotalElement.textContent.replace("$ ", ""));
      total += subtotal;
    });
    totalCartElement.textContent = total;
  }

  cartItems.forEach(cartItem => {
    calcularSubtotal(cartItem);

    const botonIncrementar = cartItem.querySelector(".butonController:nth-child(1)");
    botonIncrementar.addEventListener("click", botonIncrementarClick);

    const botonDecrementar = cartItem.querySelector(".butonController:nth-child(2)");
    botonDecrementar.addEventListener("click", botonDecrementarClick);
  });
  actualizarTotalCart();
});

// CARRITO DE COMPRAS ------> ELIMINAR PRODUCTO DEL CARRITO
document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".bi-trash");
  const cartIdElement = document.querySelector(".cartId");
  if (cartIdElement) {
    const cartId = cartIdElement.textContent.trim();
    deleteButtons.forEach(button => {
      button.setAttribute("data-cart-id", cartId);
      button.addEventListener("click", async () => {
        const productId = button.getAttribute("data-product-id");
        const cartId = button.getAttribute("data-cart-id");

        await (async () => {
          const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Se eliminará el producto de tu carrito",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#000",
            cancelButtonColor: "#FF0000",
            cancelButtonText: "Cancelar",
            confirmButtonText: "Confirmar",
          });

          if (result.isConfirmed) {
            Swal.fire({
              title: "Hecho!",
              text: "Eliminaste el producto",
              icon: "success",
              confirmButtonColor: "#000000",
            });
            try {
              const response = await fetch(`/cart/${cartId}/products/${productId}`, {
                method: "DELETE",
              });

              if (response.ok) {
                location.reload();
              } else {
              }
            } catch (error) {
              Swal.fire({
                icon: "warning",
                confirmButtonText: "Aceptar",
                confirmButtonColor: "#000",
                onAfterClose: () => {
                  window.location.href = "/home";
                },
                timer: 3000,
              });
              setTimeout(() => {
                window.location.href = "/home";
              }, 3000);
             }
          }
        })();
      });
    });
  }
  // CARRITO DE COMPRAS ------> VACIAR TODO EL CARRITO
  const vaciarCarritoButton = document.getElementById("carrito-acciones-vaciar");
  if (vaciarCarritoButton) {
    vaciarCarritoButton.addEventListener("click", async () => {
      const cartId = cartIdElement.textContent.trim();
      await Swal.fire({
        title: "¿Estás seguro?",
        text: "Se vaciará tu carrito",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#000",
        cancelButtonColor: "#FF0000",
        cancelButtonText: "Cancelar",
        confirmButtonText: "Confirmar",
      }).then(async result => {
        if (result.isConfirmed) {
          try {
            const response = await fetch(`/cart/${cartId}`, {
              method: "DELETE",
            });
            if (response.ok) {
              Swal.fire("Hecho!", "Has vaciado el carrito", "success");
              setTimeout(() => {
                location.reload();
                window.location.href = "/products";
              }, 1500);
            } else {
            }
          } catch (error) {
            console.log('error', error)
            Swal.fire({
              icon: "warning",
              confirmButtonText: "Aceptar",
              confirmButtonColor: "#000",
              onAfterClose: () => {
                window.location.href = "/home";
              },
              timer: 3000,
            });
            setTimeout(() => {
              window.location.href = "/home";
            }, 3000);
           }
        }
      });
    });
  }
});
// CARRITO DE COMPRAS -------> GUARDAR COMPRA
document.addEventListener("DOMContentLoaded", function () {
  const comprarButton = document.getElementById("carrito-acciones-comprar");
  const userEmail = document.getElementById("email").textContent;
  if (comprarButton) {
    comprarButton.addEventListener("click", async function () {
      const cartId = document.querySelector(".cartId").textContent;
      console.log(cartId);
      const totalCart = document.querySelector(".totalCart span").textContent;
      const user = userEmail;
  
      const cartData = {
        usuario: user,
        cart_id: cartId,
        total: totalCart,
      };
  
      fetch(`/cart/${cartId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartData }),
      })
        .then(response => response.json())
        .then(data => {
          console.log("Compra realizada:", data);
          Swal.fire({
            title: "¡Gracias por tu compra!",
            text: "Podrás visualizarla en MIS COMPRAS.",
            icon: "success",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#000",
            onAfterClose: () => {
              window.location.href = "/home";
            },
            timer: 3000,
          });
          setTimeout(() => {
            window.location.href = "/home";
          }, 3000);
        })
        .catch(error => {
          console.error("Error en la compra:", error);


        });
    });
  }
});

// ADMINISTRADOR DE PRODUCTOS  ----> CREAR PRODUCTO

const addProductForm = document.getElementById("addProductForm");
const btnSubmit = document.getElementById("btnSubmit");
if (addProductForm) {
  addProductForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addProduct();
  });
}

function addProduct() {
  const inputTitle = document.getElementById("input-title");
  const inputDescription = document.getElementById("input-description");
  const inputCategory = document.getElementById("input-category");
  const inputPrice = document.getElementById("input-price");
  const inputThumbnail = document.getElementById("input-thumbnail");
  const inputCode = document.getElementById("input-code");
  const inputStock = document.getElementById("input-stock");

  const newProduct = {
    title: inputTitle.value,
    description: inputDescription.value,
    category: inputCategory.value,
    price: parseFloat(inputPrice.value),
    thumbnail: inputThumbnail.value,
    code: inputCode.value,
    stock: parseInt(inputStock.value),
  };

  fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newProduct),
  })
    .then(response => {
      if (response.ok) {
        Swal.fire({
          title: "Producto Creado",
          text: "El producto ha sido creado correctamente.",
          icon: "success",
          timer: 3000,
          showConfirmButton: true,
          confirmButtonColor: "#3085d6",
        }).then(() => {
          location.reload();
        });
      } else {
        Swal.fire("Error", "No se pudo agregar el producto.", "error");
      }
    })
    .catch(error => {
      console.error("Error:", error);
    });
}

function saveChanges() {
  const modalElement = document.getElementById("exampleModal");
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  modalInstance.hide();
  modalElement.addEventListener("hidden.bs.modal", () => {
    const backdropElement = document.querySelector(".modal-backdrop");
    if (backdropElement) {
      backdropElement.parentNode.removeChild(backdropElement);
    }
    document.body.style.overflow = "auto";
  });
}

// ADMINISTRADOR DE PRODUCTOS  ----> EDITAR PRODUCTO

// DETECTAR ID EN MODAL
function setModalTitle(id) {
  const modalTitle = document.getElementById("exampleModalLabel");
  modalTitle.innerText = "Editar Producto con el ID " + id;
}

function editProduct(productId) {
  Swal.fire({
    title: "¿Estás seguro de editar este producto?",
    text: "Esta acción modificará el producto.",
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, editar",
    cancelButtonText: "Cancelar",
  }).then(result => {
    if (result.isConfirmed) {
      const editTitle = document.getElementById("input-editTitle").value;
      const editDescription = document.getElementById("input-editDescription").value;
      const editCategory = document.getElementById("input-editCategory").value;
      const editPrice = parseFloat(document.getElementById("input-editPrice").value);
      const editThumbnail = document.getElementById("input-editThumbnail").value;
      const editCode = document.getElementById("input-editCode").value;
      const editStock = parseInt(document.getElementById("input-editStock").value);

      const editedProduct = {
        title: editTitle,
        description: editDescription,
        category: editCategory,
        price: editPrice,
        thumbnail: editThumbnail,
        code: editCode,
        stock: editStock,
      };

      fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedProduct),
      })
        .then(response => {
          if (response.ok) {
            Swal.fire({
              title: "Editado",
              text: "El producto ha sido editado correctamente.",
              icon: "success",
              timer: 3000,
              showConfirmButton: true,
              confirmButtonColor: "#3085d6",
            }).then(() => {
              location.reload();
            });
          } else {
            Swal.fire("Error", "No se pudo editar el producto.", "error");
          }
        })
        .catch(error => {
          console.error("Error:", error);
        });
    }
  });
}

// ADMINISTRADOR DE PRODUCTOS  ----> ELIMINAR PRODUCTO

function deleteProduct(productId) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })
        .then(response => {
          if (response.ok) {
            Swal.fire({
              title: "Eliminado",
              text: "El producto ha sido eliminado.",
              icon: "success",
              timer: 3000,
              showConfirmButton: true,
              confirmButtonColor: "#3085d6",
            }).then(() => {
              location.reload();
            });
          } else {
            Swal.fire("Error", "No se pudo eliminar el producto.", "error");
          }
        })
        .catch(error => {
          console.error("Error:", error);
        });
    }
  });
}

// ADMINISTRADOR DE PRODUCTOS  ----> FUNCION PARA RECORRER BOTONES Y GUARDAR CAMBIOS AL EDITAR / ELIMINAR

document.addEventListener("DOMContentLoaded", function () {
  const deleteButtons = document.querySelectorAll(".btnDelete");
  const editButtons = document.querySelectorAll(".btnEdit");
  let productIdToEdit = null;

  deleteButtons.forEach(button => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      const productId = this.getAttribute("data-id");
      deleteProduct(productId);
    });
  });

  editButtons.forEach(button => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      const productId = this.getAttribute("data-id");
      productIdToEdit = productId;
    });
  });

  const btnSaveEdit = document.getElementById("btn-edit");
  if (btnSaveEdit) {
    btnSaveEdit.addEventListener("click", function () {
      if (productIdToEdit !== null) {
        editProduct(productIdToEdit);
      } else {
        alert("No se ha seleccionado un producto para editar.");
      }
    });
  }
});
