
let products = getProductLocalStorage() || [];
let productOrders = getProductOrders() || [];
let product = {};
const productForm = document.getElementById('productform');
const productOrderForm = document.getElementById('productOrderForm');
const usingForUpdate = document.getElementById('usingforupdate');
document.getElementById('updatedatWrapper').style.display = 'none';
let message = '';
const currentDate = new Date();
document.getElementById('createdAt').value = currentDate.toISOString().split('T')[0];
let editingIndex = -1;

renderProductCards();
renderProductOrderTable();

function formSubmit(event) {
    event.preventDefault();
    const productData = {};
    const index = document.getElementById('usingForUpdate').value;
    Array.from(productForm.elements).forEach((element) => {
        if (element.name && element.value) {
            productData[element.name] = element.value;
        } else {
            productData[element.name] = element.value;
        }
    });
    if (index) {
        products.splice(index, 1, productData);
        message = `<h4 class="text-blue-600 text-md">Information About Update</h4><p class="mt-2 text-sm text-gray-600">Product Information Updated Successfully!<p>`;
    } else {
        products.push(productData);
        message = `<h4 class="text-blue-600 text-md">Information About Submit</h4><p class="mt-2 text-sm text-gray-600">Product Information Added Successfully!<p>`;
    }
    setProductLocalStorage();
    productFormReset();
    renderProductCards();
    createProductDropdownOptions();
    alertToast(message);
}



function createProductDropdownOptions() {
    products = getProductLocalStorage() || [];
    if (products) {
        const selectBox = document.getElementById("productDropdown");
        selectBox.innerHTML = `<option value="">None</option>`;
        products.forEach(product => {
            const disabledAttr = product.qty == 0 ? 'disabled' : '';  // Check if quantity is zero
            selectBox.innerHTML += `<option value="${product.id}" ${disabledAttr}>${product.name}</option>`;
        });
    }
}

function productChange(event) {
    console.log('productChange', event.target.value);
    product = products[event.target.selectedIndex - 1] || {};
    const productInitialQty = 1;
    const tax = 18;
    document.getElementById('productQty').value = productInitialQty;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productTax').value = tax;
    document.getElementById('total').value = getProductTotal(productInitialQty, product.price, tax);
}

function productQtyChange(event) {
    console.log('productQtyChange', event.target.value);
    const total = getProductTotal(event.target.value, product.price, document.getElementById('productTax').value);
    console.log(total);
    console.log(document.getElementById('total'));
    document.getElementById('total').value = total;

}

function getProductTotal(qty, price, tax) {
    const total = parseInt(qty) * parseInt(price);
    const taxRate = (total * tax) / 100;
    return total + taxRate;
}

function renderProductCards() {
    products = getProductLocalStorage() || [];
    const productListDiv = document.getElementById('productLists');
    productListDiv.innerHTML = '';
    products.forEach((prod, index) => {
        const card = `
            <div class="w-[33%] mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-4">
                    <div class="flex justify-between">
                        <h3 class="text-lg font-bold text-gray-800">${prod.name}</h3>
                        <div class="flex gap-5">
                            <div class="editProduct" data-index=${index}>Edit</div>
                            <div class="deleteProduct" data-index=${index}>Delete</div>
                        </div>
                    </div>
                    <p class="text-gray-600 mt-2">${prod.description}</p>
                    <p class="text-gray-600 mt-2">Quantity : ${prod.qty}</p>
                    <p class="text-gray-600 mt-2">Price :${prod.price}</p>
                </div>
            </div>`;
        productListDiv.innerHTML = productListDiv.innerHTML + card;
    });
    createProductDropdownOptions();
}


document.getElementById('productLists').addEventListener('click', function (event) {
    const target = event.target;
    console.log(target)
    if (target.classList.contains('editProduct')) {
        const index = target.getAttribute('data-index');
        editProduct(index);
    }

    if (target.classList.contains('deleteProduct')) {
        const index = target.getAttribute('data-index');
        deleteProduct(index);
    }
})


// Edit the cart
function editProduct(index) {
    product = products[index];
    Object.keys(product).forEach(key => {
        if (document.getElementById(key)) {
            document.getElementById(key).value = product[key];
        }
    });
    document.getElementById('usingForUpdate').value = index;
    document.getElementById('createdatWrapper').style.display = 'none';
    document.getElementById('updatedatWrapper').style.display = 'block';
    document.getElementById('updatedAt').value = currentDate.toISOString().split('T')[0];
    document.getElementById('submitBtn').innerText = 'Update';
}
document.getElementById("productLists").addEventListener("click", function (event) {
    const target = even.target;
    if (target.productLists.contains("updateproduct")) {
        const index = target.getAttribute('productform');
        updateproduct(index);
    }
    if (target.productLists.contains("deleteproduct")) {
        const index = target.getAttribute('index');
        deleteProduct(index);
    }
})

function deleteProduct(index) {
    products.splice(index, 1)
    setProductLocalStorage();
    renderProductCards();
}
function setProductLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
}

function getProductLocalStorage() {
    return JSON.parse(localStorage.getItem('products'));
}

function setProductOrders() {
    localStorage.setItem('productOrders', JSON.stringify(productOrders));
}

function getProductOrders() {
    return JSON.parse(localStorage.getItem('productOrders'));
}

function alertToast(message) {
    if (message) {
        document.getElementById('toast').style.display = 'block';
        document.getElementById('toast').innerHTML = message;
        setTimeout(() => {
            document.getElementById('toast').style.display = 'none';
            document.getElementById('toast').innerHTML = '';
        }, 7000);
    }
}

function productFormReset() {
    productForm.reset();
    document.getElementById('submitBtn').innerText = 'Submit';
    document.getElementById('usingForUpdate').value = null;

}
function orderSubmit(event) {
    event.preventDefault();
    const productOrderData = {};
    Array.from(productOrderForm.elements).forEach((element) => {
        if (element.name && element.value) {
            productOrderData[element.name] = element.value;
        }
    });
    productOrders.push(productOrderData);
    reduceProductQuantity(productOrderData);
    setProductOrders();
    productOrderFormReset();
    renderProductOrderTable();

}
function productOrderFormReset() {
    productOrderForm.reset();
}
function reduceProductQuantity(productOrderData) {
    const productId = productOrderData.productDropdown;
    const index = products.findIndex(product => product.id === productId);
    products[index].qty = parseInt(products[index].qty) - parseInt(productOrderData.productQty);
    products.splice(index, 1, products[index]);
    console.log(products[index])

    setProductLocalStorage();
    renderProductCards();
}
function renderProductOrderTable(){
    const tableBody = document.getElementById("product-order-data");
    tableBody.innerHTML = '';

    productOrders.forEach((productorder, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2 border border-blue-300">${index+1}</td>
            <td class="p-2 border border-blue-300">${productorder.productDropdown}</td>
            <td class="p-2 border border-blue-300">${productorder.productQty}</td>
            <td class="p-2 border border-blue-300">${productorder.productPrice}</td>
            <td class="p-2 border border-blue-300">${productorder.productTax}</td>
            <td class="p-2 border border-blue-300" colspan="2">${productorder.total}</td>
            `;
        tableBody.appendChild(row);
    }); 
}
