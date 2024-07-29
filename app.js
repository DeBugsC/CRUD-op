const token = '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'; // Replace with your actual token
const repoOwner = 'AbdlrhmnAtallh'; // Owner of the repo containing the JSON file
const repoName = 'FirstWebsiteTemplate'; // Repo containing the JSON file
const filePath = 'products.json'; // Path to your JSON file in the repo

let products = [];
let editMode = false;
let editId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

async function fetchFile() {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    const data = await response.json();
    const content = atob(data.content);
    return JSON.parse(content);
}

async function updateFile(content) {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    const data = await response.json();
    const sha = data.sha;

    await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            message: 'Updating JSON file',
            content: btoa(JSON.stringify(content)),
            sha: sha
        })
    });
}

async function loadProducts() {
    try {
        products = await fetchFile();
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function addProduct() {
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const description2Text = document.getElementById('description2').value;
    const description2 = description2Text.split(',').map(text => ({ phrase: text.trim() }));
    const relatedproducts = document.getElementById('relatedproducts').value.split(',').map(Number);
    const price = document.getElementById('price').value;

    const imagepath1 = document.getElementById('imageurl1').value;
    const imagefile1 = document.getElementById('imagepath1').files[0];
    const imagepath2 = document.getElementById('imageurl2').value;
    const imagefile2 = document.getElementById('imagepath2').files[0];
    const imagepath3 = document.getElementById('imageurl3').value;
    const imagefile3 = document.getElementById('imagepath3').files[0];
    const imagepath4 = document.getElementById('imageurl4').value;
    const imagefile4 = document.getElementById('imagepath4').files[0];
    const imagepath5 = document.getElementById('imageurl5').value;
    const imagefile5 = document.getElementById('imagepath5').files[0];

    if (!name || !price || (!imagepath1 && !imagefile1 && !editMode)) {
        alert('Name, Price, and at least one Image Path or File are required');
        return;
    }

    const getImagePath = (url, file) => {
        if (file) {
            return URL.createObjectURL(file);
        } else if (url) {
            return url;
        } else {
            return '';
        }
    };

    if (editMode) {
        const product = products.find(p => p.Id === editId);
        product.Name = name;
        product.Description = description;
        product.Description2 = description2;
        product.relatedproducts = relatedproducts;
        product.Price = Number(price);
        product.ImagePath1 = getImagePath(imagepath1, imagefile1) || product.ImagePath1;
        product.ImagePath2 = getImagePath(imagepath2, imagefile2) || product.ImagePath2;
        product.ImagePath3 = getImagePath(imagepath3, imagefile3) || product.ImagePath3;
        product.ImagePath4 = getImagePath(imagepath4, imagefile4) || product.ImagePath4;
        product.ImagePath5 = getImagePath(imagepath5, imagefile5) || product.ImagePath5;
    } else {
        const newProduct = {
            Id: products.length ? Math.max(...products.map(p => p.Id)) + 1 : 1,
            Name: name,
            Description: description,
            Description2: description2,
            relatedproducts: relatedproducts,
            Price: Number(price),
            ImagePath1: getImagePath(imagepath1, imagefile1),
            ImagePath2: getImagePath(imagepath2, imagefile2) || null,
            ImagePath3: getImagePath(imagepath3, imagefile3) || null,
            ImagePath4: getImagePath(imagepath4, imagefile4) || null,
            ImagePath5: getImagePath(imagepath5, imagefile5) || null,
            ZoneAreas: null,
            Category: null
        };

        products.push(newProduct);
    }

    await updateFile(products);
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
}

function displayProducts() {
    const tableBody = document.getElementById('productTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    products.forEach(product => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = product.Id;
        row.insertCell(1).textContent = product.Name;
        row.insertCell(2).textContent = product.Description;

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
    saveProducts(); // Ensure products are saved after deletion
}

async function saveProducts() {
    try {
        await updateFile(products);
        console.log('Products saved:', products);
    } catch (error) {
        console.error('Error saving products:', error);
    }
}

function previewImage(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = '';
    }
}
