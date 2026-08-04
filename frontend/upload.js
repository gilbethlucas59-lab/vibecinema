document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('type', document.getElementById('type').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('media', document.getElementById('media-file').files[0]);

    try {
        const res = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (res.ok) {
            alert("Upload Successful!");
            window.location.href = 'index.html';
        } else {
            const err = await res.json();
            alert("Upload Failed: " + (err.error || "Server error"));
        }
    } catch (err) {
        alert("Connection Error. Is the backend running?");
    }
});
