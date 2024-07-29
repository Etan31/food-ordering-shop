function addToOrder(menu_id, seller_id) {
    fetch(`/bufpay-user/addOrder`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ menu_id: menu_id , seller_id: seller_id}) // Pass menu_id in the request body
    })
    .then(response => {
        if (response.ok) {
            alert("Order added");
            window.location.reload();
        } else if (response.status === 400) {
            // Item already exists in the order list
            return response.json(); // Parse response JSON
        } else {
            console.error('Adding order failed');
        }
    })
    .then(data => {
        if (data && data.message) {
            // Display the message to the user
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
