
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
    const modal = document.getElementById('modal1');
    const modal2 = document.getElementById('modal2');
    const photoValid = document.querySelector('.uploadID input[type="file"]');
    
    toggleAddressRequirement();

     if (!photoValid.files.length) {
        alert('Please upload a valid ID photo.');
        return;
    }

    if (document.querySelector('.orderForm').checkValidity()) {
      // If valid, display the second modal
      modal2.style.display = 'flex';
      modal.style.display = 'none';
    } else {
      // If not valid, you can optionally show an alert or handle it in another way
      alert('Please fill out all required fields.');
      return;
    }
  }

   document.getElementById('confirmButton').addEventListener('click', submitBtn);

  // Attach event listener to the confirm button
function formatTrakNum(input) {
  // Remove any non-digit characters
  let cleaned = input.replace(/\D/g, '');

  // Limit to exactly 13 digits
  cleaned = cleaned.substring(0, 13);

  // Format as "1234 567 123457"
  let formatted = cleaned.replace(/(\d{4})(\d{3})(\d{6})/, '$1 $2 $3');

  return formatted;
}

document.getElementById('trakNum').addEventListener('input', function(event) {
  const input = event.target;
  const formattedValue = formatTrakNum(input.value);

  // Set the formatted value back to the input
  input.value = formattedValue;

  // Move the cursor to the end of the input
  const cursorPosition = formattedValue.length;
  input.setSelectionRange(cursorPosition, cursorPosition);
});

function ok() {
  const form = document.getElementById('orderForm');
  const formData = new FormData(form);
  const trakNum = document.getElementById('trakNum').value.replace(/\s+/g, ''); // Remove spaces before sending

  if (trakNum.length !== 13) {
    alert("Please enter a valid 13-digit Gcash reference number before checking out.");
    return;
  }

  formData.append('transaction_num', trakNum);

  fetch('/save-order', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (response.ok) {
      return fetch('/bufpay-user/deleteAllOrders', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      throw new Error('Order submission failed');
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

document.getElementById('okBtn').addEventListener('click', ok);


  // Attach event listener to the go back button to return to the first modal
  document.getElementById('goBackButton').addEventListener('click', () => {
    document.getElementById('modal2').style.display = 'none';
    document.getElementById('modal1').style.display = 'flex';
  });

  // Attach event listener to the cancel button to hide the first modal
  document.getElementById('cancelButton').addEventListener('click', () => {
    document.getElementById('modal1').style.display = 'none';
  });



function toggleAddressRequirement() {
  const deliveryCheckbox = document.getElementById('deliveryCheckbox');
  const deliveryAddress = document.getElementById('deliveryAddress');

  if (deliveryCheckbox.checked) {
    deliveryAddress.setAttribute('required', 'required');
  } else {
    deliveryAddress.removeAttribute('required');
  }
}

// Call toggleAddressRequirement on page load to handle pre-selected options (if any)
window.onload = toggleAddressRequirement;








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
    const newQuantity = parseFloat(event.target.value); // Get the new quantity as a float
    const pricePerUnit = parseFloat(event.target.getAttribute('data-price')); // Get the price per unit
    const newPrice = newQuantity * pricePerUnit; // Calculate the new price for the selected quantity

    // Update the displayed price for this item
    const priceCell = event.target.closest('tr').querySelector('.price');
    priceCell.textContent = newPrice.toFixed(2); // Update price with 2 decimal places

    // Update the total price
    updateTotalPrice();

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

function updateTotalPrice() {
    let totalPrice = 0;

    // Iterate over each row in the order table
    document.querySelectorAll('.orderTable tbody tr').forEach(row => {
        const quantity = parseFloat(row.querySelector('.quantity').value);
        const pricePerUnit = parseFloat(row.querySelector('.quantity').getAttribute('data-price'));
        const price = quantity * pricePerUnit;
        totalPrice += price;
    });

    // Update the total price label
    document.getElementById('totalPrice').textContent = totalPrice.toFixed(2) + ' Pesos';
}