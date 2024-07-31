
function proceed() {
  const modal = document.getElementById('modal1')
  modal.style.display = "flex";
}
document.addEventListener('DOMContentLoaded', function() {
  const cancelButton = document.getElementById('cancelButton');
  cancelButton.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default form submission behavior
    cancelBtn(); // Call the cancelBtn function
  });
});

function cancelBtn() {
  const modal = document.getElementById('modal1')
  modal.style.display = "none";
}

function submitBtn() {
  const modal = document.getElementById('modal1')
  const modal2 = document.getElementById('modal2')

  if (document.querySelector('.orderForm').checkValidity()) {
    // If valid, display the modal
    document.getElementById('modal2').style.display = 'flex';
    alert("order is successfully submitted")

  } else {
    // If not valid, you can optionally show an alert or handle it in another way
    alert('Please fill out all required fields.');
    return;
  }

  modal2.style.display = "flex";
  modal.style.display = "none";
}

function ok() {
  fetch('/bufpay-user/deleteAllOrders', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      alert("Your order is now processing");
      window.location.href = "/bufpay-home";
    } else {
      console.error('Deleting all orders failed');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const deliveryCheckbox = document.getElementById('deliveryCheckbox');
  const pickupCheckbox = document.getElementById('pickupCheckbox');
  const address = document.getElementById('deliveryAddress');
 
  deliveryCheckbox.checked = true; // Uncheck pickup checkbox
  deliveryCheckbox.addEventListener('change', function() {
    if (this.checked) {
      address.style.display = "flex"
    }
  });
  pickupCheckbox.addEventListener('change', function() {
    if (this.checked) {
      address.style.display = "none"

    }
  });
});



// Add event listener to quantity input fields
document.querySelectorAll('.quantity').forEach(input => {
input.addEventListener('input', function() {
    // Get the price from data attribute
    const price = parseFloat(this.dataset.price);
    // Get the quantity entered by the user
    const quantity = parseInt(this.value);
    // Calculate the new price for this item
    const totalPriceItem = price * quantity;
    // Update the price cell in the same row
    const priceCell = this.parentNode.nextElementSibling;
    priceCell.textContent = totalPriceItem.toFixed(2);

    // Update total price
    updateTotalPrice();
});
});

// Function to update the total price
function updateTotalPrice() {
let totalPrice = 0;
document.querySelectorAll('.quantity').forEach(input => {
    const price = parseFloat(input.dataset.price);
    const quantity = parseInt(input.value);
    totalPrice += price * quantity;
});
// Update the total price cell
document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
}




//delete orders

function deleteBtn(food_id) {
  fetch('/bufpay-user/deleteOrder', {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ food_id: food_id }) // Pass food_id in the request body

      
  })
  .then(response => {
      if (response.ok) {
          alert("Order deleted successfully");
          // Refresh the page or update the UI as needed
          window.location.reload(); // Example: Refresh the page
      } else {
          console.error('Deleting order failed');
      }
  })
  .catch(error => {
      console.error('Error:', error);
  });
}


// Function to handle quantity change
function handleQuantityChange(event, food_id) {
  const newQuantity = event.target.value; // Get the new quantity
  const data = {
      food_id: food_id,
      quantity: newQuantity
  };

  // Send updated quantity to the server to update in the database
  fetch('/bufpay-user/updateQuantity', {
      method: 'PUT', // Use PUT method to update data
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  })
  .then(response => {
      if (response.ok) {
          console.log('Quantity updated successfully');
      } else {
          console.error('Updating quantity failed');
      }
  })
  .catch(error => {
      console.error('Error:', error);
  });
}
