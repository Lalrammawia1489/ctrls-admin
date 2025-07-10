console.log("✅ script.js loaded");

// ✅ Firebase setup
const auth = firebase.auth();
const db = firebase.firestore();

const cloudName = "dfqm2quzj"; // Replace with your Cloudinary cloud name
const uploadPreset = "ctrls-upload"; // Replace with your Cloudinary upload preset

// ✅ Admin Login
function adminLogin() {
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;
  const errorDisplay = document.getElementById("login-error");

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("upload-section").style.display = "block";
      errorDisplay.innerText = "";
      fetchProducts();
    })
    .catch((error) => {
      console.error("❌ Login failed:", error.message);
      errorDisplay.innerText = error.message;
    });
}

// ✅ Logout
function logout() {
  auth.signOut().then(() => {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("upload-section").style.display = "none";
  });
}

// ✅ Image Preview
function previewImage() {
  const fileInput = document.getElementById('product-image');
  const preview = document.getElementById('image-preview');
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
    preview.style.display = "none";
  }
}

// ✅ Upload Product
async function uploadProduct() {
  const name = document.getElementById("product-name").value.trim();
  const price = parseFloat(document.getElementById("product-price").value);
  const description = document.getElementById("product-description").value.trim();
  const file = document.getElementById("product-image").files[0];
  const status = document.getElementById("upload-status");

  if (!name || isNaN(price) || !file) {
    status.innerText = "❌ Please fill all required fields.";
    return;
  }

  status.innerText = "⏳ Uploading...";

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );

    const imageUrl = response.data.secure_url;

    await db.collection("products").add({
      name,
      price,
      description,
      imageUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    status.innerText = "✅ Product uploaded successfully!";
    document.getElementById("product-name").value = "";
    document.getElementById("product-price").value = "";
    document.getElementById("product-description").value = "";
    document.getElementById("product-image").value = "";
    previewImage();
    fetchProducts();
  } catch (error) {
    console.error("❌ Upload failed:", error);
    status.innerText = "❌ Upload failed.";
  }
}

// ✅ Fetch and Display Products
function fetchProducts() {
  const container = document.getElementById("product-list");
  container.innerHTML = "⏳ Loading...";

  db.collection("products").orderBy("createdAt", "desc").get()
    .then(snapshot => {
      container.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const id = doc.id;

        const card = document.createElement("div");
        card.innerHTML = `
          <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
            <img src="${data.imageUrl}" alt="${data.name}" style="max-width:100px;"><br>
            <strong>${data.name}</strong><br>
            ₹${data.price}<br>
            <small>${data.description || ""}</small><br><br>
            <button onclick="deleteProduct('${id}')">🗑️ Delete</button>
            <button onclick="editProduct('${id}', '${data.name}', ${data.price}, \`${data.description || ""}\`)">✏️ Edit</button>
          </div>
        `;
        container.appendChild(card);
      });
    });
}

// ✅ Delete Product
function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    db.collection("products").doc(id).delete().then(() => {
      alert("✅ Product deleted.");
      fetchProducts();
    }).catch(err => {
      console.error("❌ Delete failed:", err);
    });
  }
}

// ✅ Edit Product (load into form)
function editProduct(id, name, price, description) {
  document.getElementById("product-name").value = name;
  document.getElementById("product-price").value = price;
  document.getElementById("product-description").value = description;
  document.getElementById("upload-status").innerText = "⚙️ Editing product...";

  // Replace upload button temporarily
  const uploadBtn = document.getElementById("upload-product-btn");
  uploadBtn.innerText = "Update Product";
  uploadBtn.onclick = function () {
    updateProduct(id);
  };
}

// ✅ Update Product (text data only, not image)
function updateProduct(id) {
  const name = document.getElementById("product-name").value.trim();
  const price = parseFloat(document.getElementById("product-price").value);
  const description = document.getElementById("product-description").value.trim();

  if (!name || isNaN(price)) {
    alert("❌ Please fill all required fields.");
    return;
  }

  db.collection("products").doc(id).update({
    name,
    price,
    description
  }).then(() => {
    document.getElementById("upload-status").innerText = "✅ Product updated.";
    document.getElementById("product-name").value = "";
    document.getElementById("product-price").value = "";
    document.getElementById("product-description").value = "";
    document.getElementById("upload-product-btn").innerText = "Upload Product";
    document.getElementById("upload-product-btn").onclick = uploadProduct;
    fetchProducts();
  }).catch((error) => {
    console.error("❌ Update failed:", error);
  });
}
