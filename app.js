let products = [];
let editMode = false;
let editId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

function loadProducts() {
    // Load product data from JSON
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            displayProducts();
        })
        .catch(error => console.error('Error loading products:', error));
}

function previewImage(fileInputId, previewId) {
    const fileInput = document.getElementById(fileInputId);
    const preview = document.getElementById(previewId);
    const urlInputId = fileInputId.replace('imagepath', 'imageurl');
    const urlInput = document.getElementById(urlInputId);

    if (fileInput.files && fileInput.files[0]) {
        preview.src = URL.createObjectURL(fileInput.files[0]);
        urlInput.value = ''; // Clear URL input
    } else {
        preview.src = urlInput.value;
    }
}

function addProduct() {
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const description2Text = document.getElementById('description2').value;
    const description2 = description2Text.split(',').map(text => ({ phrase: text.trim() }));
    const relatedproducts = document.getElementById('relatedproducts').value.split(',').map(Number);
    const price = document.getElementById('price').value;

    const imagepath1 = getImagePath('imagepath1', 'imageurl1');
    const imagepath2 = getImagePath('imagepath2', 'imageurl2');
    const imagepath3 = getImagePath('imagepath3', 'imageurl3');
    const imagepath4 = getImagePath('imagepath4', 'imageurl4');
    const imagepath5 = getImagePath('imagepath5', 'imageurl5');

    if (!name || !price || (!imagepath1 && !editMode)) {
        alert('Name, Price, and Image Path 1 are required');
        return;
    }

    if (editMode) {
        const product = products.find(p => p.Id === editId);
        product.Name = name;
        product.Description = description;
        product.Description2 = description2;
        product.relatedproducts = relatedproducts;
        product.Price = Number(price);
        product.ImagePath1 = imagepath1 || product.ImagePath1;
        product.ImagePath2 = imagepath2 || product.ImagePath2;
        product.ImagePath3 = imagepath3 || product.ImagePath3;
        product.ImagePath4 = imagepath4 || product.ImagePath4;
        product.ImagePath5 = imagepath5 || product.ImagePath5;
    } else {
        const newProduct = {
            Id: products.length ? Math.max(...products.map(p => p.Id)) + 1 : 1,
            Name: name,
            Description: description,
            Description2: description2,
            relatedproducts: relatedproducts,
            Price: Number(price),
            ImagePath1: imagepath1,
            ImagePath2: imagepath2,
            ImagePath3: imagepath3,
            ImagePath4: imagepath4,
            ImagePath5: imagepath5,
            ZoneAreas: null,
            Category: null
        };

        products.push(newProduct);
    }

    displayProducts();
    document.getElementById('productForm').reset();
    editMode = false;
    editId = null;

    // Reset image previews
    document.getElementById('preview1').src = '';
    document.getElementById('preview2').src = '';
    document.getElementById('preview3').src = '';
    document.getElementById('preview4').src = '';
    document.getElementById('preview5').src = '';

    // Save products to JSON file
    saveProducts();
}

function getImagePath(fileInputId, urlInputId) {
    const fileInput = document.getElementById(fileInputId);
    const urlInput = document.getElementById(urlInputId);

    if (fileInput.files && fileInput.files[0]) {
        return URL.createObjectURL(fileInput.files[0]);
    } else if (urlInput.value) {
        return urlInput.value;
    } else {
        return null;
    }
}

function displayProducts() {
    const tableBody = document.getElementById('productTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    products.forEach(product => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = product.Id;
        row.insertCell(1).textContent = product.Name;
        row.insertCell(2).textContent = product.Description;

        // Format description2
        const description2Cell = row.insertCell(3);
        description2Cell.innerHTML = product.Description2.map(d => `<span>${d.phrase}</span>`).join(', ');

        row.insertCell(4).textContent = product.relatedproducts.join(', ');
        row.insertCell(5).textContent = product.Price;

        const imgCell = row.insertCell(6);
        const img = document.createElement('img');
        img.src = product.ImagePath1;
        img.alt = product.Name;
        img.width = 50;
        imgCell.appendChild(img);

        const actionsCell = row.insertCell(7);
        actionsCell.className = 'actions';

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editProduct(product.Id);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteProduct(product.Id);
        actionsCell.appendChild(deleteButton);
    });
}

function editProduct(id) {
    const product = products.find(p => p.Id === id);
    if (!product) {
        alert('Product not found');
        return;
    }

    document.getElementById('name').value = product.Name;
    document.getElementById('description').value = product.Description;
    document.getElementById('description2').value = product.Description2.map(d => d.phrase).join(', ');
    document.getElementById('relatedproducts').value = product.relatedproducts.join(',');
    document.getElementById('price').value = product.Price;

    editMode = true;
    editId = id;

    // Show existing image previews
    document.getElementById('preview1').src = product.ImagePath1 || '';
    document.getElementById('preview2').src = product.ImagePath2 || '';
    document.getElementById('preview3').src = product.ImagePath3 || '';
    document.getElementById('preview4').src = product.ImagePath4 || '';
    document.getElementById('preview5').src = product.ImagePath5 || '';
}

function deleteProduct(id) {
    products = products.filter(product => product.Id !== id);
    displayProducts();
}

function saveProducts() {
    // Simulate saving to the JSON file
    console.log('Products saved:', products);
}
