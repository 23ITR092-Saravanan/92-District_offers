// Initialize data storage
let owners = JSON.parse(localStorage.getItem('owners')) || [];
let offers = JSON.parse(localStorage.getItem('offers')) || [];
let currentOwner = JSON.parse(sessionStorage.getItem('currentOwner')) || null;
let currentCustomer = JSON.parse(sessionStorage.getItem('currentCustomer')) || null;

// Utility Functions
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    document.querySelector('.container').insertBefore(messageDiv, document.querySelector('.container').firstChild);
}

function showErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.textContent = message;
    document.querySelector('.container').insertBefore(messageDiv, document.querySelector('.container').firstChild);
}

// Owner Create Account
if (document.getElementById('createAccountForm')) {
    document.getElementById('createAccountForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const shopId = document.getElementById('shopId').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const shopLogoFile = document.getElementById('shopLogo').files[0];
        
        if (password !== confirmPassword) {
            showErrorMessage('Passwords do not match!');
            return;
        }
        
        // Check if shop ID already exists
        if (owners.find(owner => owner.shopId === shopId)) {
            showErrorMessage('Shop ID already exists!');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const owner = {
                name: name,
                shopId: shopId,
                password: password,
                shopLogo: event.target.result
            };
            
            owners.push(owner);
            localStorage.setItem('owners', JSON.stringify(owners));
            
            showSuccessMessage('Account created successfully!');
            setTimeout(() => {
                window.location.href = 'owner-login.html';
            }, 2000);
        };
        
        if (shopLogoFile) {
            reader.readAsDataURL(shopLogoFile);
        } else {
            showErrorMessage('Please select a shop logo!');
        }
    });
}

// Owner Sign In
if (document.getElementById('signInForm')) {
    document.getElementById('signInForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const shopId = document.getElementById('loginShopId').value;
        const password = document.getElementById('loginPassword').value;
        
        const owner = owners.find(o => o.shopId === shopId && o.password === password);
        
        if (owner) {
            sessionStorage.setItem('currentOwner', JSON.stringify(owner));
            showSuccessMessage('Login successful!');
            setTimeout(() => {
                window.location.href = 'owner-dashboard.html';
            }, 1500);
        } else {
            showErrorMessage('Invalid credentials!');
        }
    });
}

// Logout Owner
function logout() {
    sessionStorage.removeItem('currentOwner');
    window.location.href = 'index.html';
}

// Publish New Offer
if (document.getElementById('publishOfferForm')) {
    document.getElementById('publishOfferForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentOwner) {
            alert('Please login first!');
            window.location.href = 'owner-signin.html';
            return;
        }
        
        const offerImageFile = document.getElementById('offerImage').files[0];
        
        if (!offerImageFile) {
            showErrorMessage('Please select an offer image!');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const offer = {
                id: Date.now(),
                ownerId: currentOwner.shopId,
                shopName: document.getElementById('shopName').value,
                shopAddress: document.getElementById('shopAddress').value,
                email: document.getElementById('email').value,
                stocks: document.getElementById('stocks').value,
                contactNumber: document.getElementById('contactNumber').value,
                startDate: document.getElementById('startDate').value,
                endDate: document.getElementById('endDate').value,
                offerTitle: document.getElementById('offerTitle').value,
                offerImage: event.target.result,
                description: document.getElementById('description').value,
                city: document.getElementById('city').value,
                category: document.getElementById('category').value,
                comments: [],
                ratings: []
            };
            
            offers.push(offer);
            localStorage.setItem('offers', JSON.stringify(offers));
            
            showSuccessMessage('Offer uploaded successfully!');
            setTimeout(() => {
                window.location.href = 'owner-dashboard.html';
            }, 2000);
        };
        
        reader.readAsDataURL(offerImageFile);
    });
}

// View Uploaded Offers (Owner)
if (document.getElementById('offersContainer')) {
    displayOwnerOffers();
}

function displayOwnerOffers() {
    if (!currentOwner) {
        alert('Please login first!');
        window.location.href = 'owner-signin.html';
        return;
    }
    
    const container = document.getElementById('offersContainer');
    const ownerOffers = offers.filter(offer => offer.ownerId === currentOwner.shopId);
    
    if (ownerOffers.length === 0) {
        container.innerHTML = '<div class="form-box"><p>No offers uploaded yet.</p></div>';
        return;
    }
    
    container.innerHTML = '';
    ownerOffers.forEach(offer => {
        const offerCard = createOwnerOfferCard(offer);
        container.appendChild(offerCard);
    });
}

function createOwnerOfferCard(offer) {
    const card = document.createElement('div');
    card.className = 'offer-card';
    
    const avgRating = calculateAverageRating(offer.ratings);
    const totalComments = offer.comments.length;
    
    card.innerHTML = `
        <h3>${offer.offerTitle}</h3>
        <img src="${offer.offerImage}" alt="${offer.offerTitle}">
        <p><strong>Shop Name:</strong> ${offer.shopName}</p>
        <p><strong>Category:</strong> ${offer.category}</p>
        <p><strong>City:</strong> ${offer.city}</p>
        <p><strong>Address:</strong> ${offer.shopAddress}</p>
        <p><strong>Contact:</strong> ${offer.contactNumber}</p>
        <p><strong>Email:</strong> ${offer.email}</p>
        <p><strong>Stocks Available:</strong> ${offer.stocks}</p>
        <p><strong>Start Date:</strong> ${offer.startDate}</p>
        <p><strong>End Date:</strong> ${offer.endDate}</p>
        <p><strong>Description:</strong> ${offer.description}</p>
        <p><strong>Average Rating:</strong> ${avgRating} ⭐ (${offer.ratings.length} ratings)</p>
        <p><strong>Total Comments:</strong> ${totalComments}</p>
        <div class="offer-actions">
            <button class="edit-btn" onclick="editOffer(${offer.id})">Edit</button>
            <button class="delete-btn" onclick="deleteOffer(${offer.id})">Delete</button>
        </div>
    `;
    return card;
}

function editOffer(offerId) {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    const newTitle = prompt('Enter new offer title:', offer.offerTitle);
    if (newTitle !== null && newTitle.trim() !== '') {
        offer.offerTitle = newTitle;
    }
    
    const newDescription = prompt('Enter new description:', offer.description);
    if (newDescription !== null && newDescription.trim() !== '') {
        offer.description = newDescription;
    }
    
    const newStocks = prompt('Enter new stock quantity:', offer.stocks);
    if (newStocks !== null && newStocks.trim() !== '') {
        offer.stocks = newStocks;
    }
    
    const newContactNumber = prompt('Enter new contact number:', offer.contactNumber);
    if (newContactNumber !== null && newContactNumber.trim() !== '') {
        offer.contactNumber = newContactNumber;
    }
    
    offers = offers.map(o => o.id === offerId ? offer : o);
    localStorage.setItem('offers', JSON.stringify(offers));
    displayOwnerOffers();
    alert('Offer updated successfully!');
}

function deleteOffer(offerId) {
    if (confirm('Are you sure you want to delete this offer?')) {
        offers = offers.filter(o => o.id !== offerId);
        localStorage.setItem('offers', JSON.stringify(offers));
        displayOwnerOffers();
        alert('Offer deleted successfully!');
    }
}

// Customer Login
if (document.getElementById('customerLoginForm')) {
    document.getElementById('customerLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const customer = {
            name: document.getElementById('customerName').value,
            mobile: document.getElementById('customerMobile').value
        };
        
        sessionStorage.setItem('currentCustomer', JSON.stringify(customer));
        window.location.href = 'customer-dashboard.html';
    });
}

// Customer Logout
function customerLogout() {
    sessionStorage.removeItem('currentCustomer');
    window.location.href = 'index.html';
}

// Customer Dashboard
if (document.getElementById('customerOffersContainer')) {
    displayCustomerOffers();
}

function displayCustomerOffers(filteredOffers = null) {
    if (!currentCustomer) {
        alert('Please login first!');
        window.location.href = 'customer-login.html';
        return;
    }
    
    const container = document.getElementById('customerOffersContainer');
    const displayOffers = filteredOffers || offers;
    
    if (displayOffers.length === 0) {
        container.innerHTML = '<div class="form-box"><p>No offers available matching your criteria.</p></div>';
        return;
    }
    
    container.innerHTML = '';
    displayOffers.forEach(offer => {
        const offerCard = createCustomerOfferCard(offer);
        container.appendChild(offerCard);
    });
}

function createCustomerOfferCard(offer) {
    const card = document.createElement('div');
    card.className = 'offer-card';
    
    const avgRating = calculateAverageRating(offer.ratings);
    
    card.innerHTML = `
        <h3>${offer.offerTitle}</h3>
        <img src="${offer.offerImage}" alt="${offer.offerTitle}">
        <p><strong>Shop Name:</strong> ${offer.shopName}</p>
        <p><strong>Category:</strong> ${offer.category}</p>
        <p><strong>City:</strong> ${offer.city}</p>
        <p><strong>Valid from:</strong> ${offer.startDate} <strong>to</strong> ${offer.endDate}</p>
        <p><strong>Average Rating:</strong> ${avgRating} ⭐ (${offer.ratings.length} ratings)</p>
        <div class="offer-actions">
            <button class="view-btn" onclick="viewOfferDetails(${offer.id})">View Details</button>
        </div>
    `;
    return card;
}

function filterOffers() {
    const category = document.getElementById('filterCategory').value;
    const city = document.getElementById('filterCity').value.toLowerCase().trim();
    
    let filteredOffers = offers;
    
    if (category) {
        filteredOffers = filteredOffers.filter(offer => offer.category === category);
    }
    
    if (city) {
        filteredOffers = filteredOffers.filter(offer => 
            offer.city.toLowerCase().includes(city)
        );
    }
    
    displayCustomerOffers(filteredOffers);
}

function viewOfferDetails(offerId) {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    const modal = document.getElementById('offerModal');
    const modalBody = document.getElementById('modalBody');
    
    const avgRating = calculateAverageRating(offer.ratings);
    
    modalBody.innerHTML = `
        <h2>${offer.offerTitle}</h2>
        <img src="${offer.offerImage}" alt="${offer.offerTitle}" style="max-width: 100%; border-radius: 5px; margin: 10px 0;">
        <p><strong>Shop Name:</strong> ${offer.shopName}</p>
        <p><strong>Address:</strong> ${offer.shopAddress}</p>
        <p><strong>Category:</strong> ${offer.category}</p>
        <p><strong>City:</strong> ${offer.city}</p>
        <p><strong>Contact:</strong> ${offer.contactNumber}</p>
        <p><strong>Email:</strong> ${offer.email}</p>
        <p><strong>Stocks Available:</strong> ${offer.stocks}</p>
        <p><strong>Valid from:</strong> ${offer.startDate} <strong>to</strong> ${offer.endDate}</p>
        <p><strong>Description:</strong> ${offer.description}</p>
        <p><strong>Average Rating:</strong> ${avgRating} ⭐ (${offer.ratings.length} ratings)</p>
        
        <div class="share-buttons" style="margin: 20px 0;">
            <h3>Share this offer:</h3>
            <button class="share-btn" onclick="shareOnWhatsApp(${offer.id})">WhatsApp</button>
            <button class="share-btn" onclick="shareOnFacebook(${offer.id})">Facebook</button>
            <button class="share-btn" onclick="shareOnInstagram(${offer.id})">Instagram</button>
        </div>
        
        <div class="rating-section">
            <h3>Rate this offer:</h3>
            <div class="stars" id="ratingStars-${offer.id}">
                ${createStarRating(offer.id)}
            </div>
        </div>
        
        <div class="comments-section">
            <h3>Comments (${offer.comments.length})</h3>
            <div class="comment-form">
                <textarea id="commentText-${offer.id}" placeholder="Write your comment..." rows="3"></textarea>
                <button class="rect-btn" onclick="addComment(${offer.id})">Post Comment</button>
            </div>
            <div id="commentsContainer-${offer.id}">
                ${displayComments(offer)}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    setupStarRating(offer.id);
}

function closeModal() {
    document.getElementById('offerModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('offerModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Share Functions
function shareOnWhatsApp(offerId) {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    const text = `Check out this amazing offer!\n\n$${offer.offerTitle}\n$$ {offer.shopName}\n${offer.description}\nValid till: ${offer.endDate}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareOnFacebook(offerId) {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(offer.offerTitle + ' - ' + offer.description)}`;
    window.open(url, '_blank');
}

function shareOnInstagram(offerId) {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    alert('To share on Instagram:\n1. Take a screenshot of this offer\n2. Open Instagram app\n3. Create a new post with the screenshot\n\nOffer: ' + offer.offerTitle);
}

// Rating System
function createStarRating(offerId) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star" data-rating="${i}">★</span>`;
    }
    return stars;
}

function setupStarRating(offerId) {
    const stars = document.querySelectorAll(`#ratingStars-${offerId} .star`);
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            submitRating(offerId, rating);
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(offerId, rating);
        });
    });
    
    document.querySelector(`#ratingStars-${offerId}`).addEventListener('mouseleave', function() {
        const offer = offers.find(o => o.id === offerId);
        const userRating = getUserRating(offer);
        highlightStars(offerId, userRating);
    });
    
    // Show user's existing rating
    const offer = offers.find(o => o.id === offerId);
    const userRating = getUserRating(offer);
    if (userRating > 0) {
        highlightStars(offerId, userRating);
    }
}

function highlightStars(offerId, rating) {
    const stars = document.querySelectorAll(`#ratingStars-${offerId} .star`);
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

function submitRating(offerId, rating) {
    if (!currentCustomer) {
        alert('Please login to rate!');
        return;
    }
    
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    // Remove existing rating from this customer
    offer.ratings = offer.ratings.filter(r => r.customerMobile !== currentCustomer.mobile);
    
    // Add new rating
    offer.ratings.push({
        customerName: currentCustomer.name,
        customerMobile: currentCustomer.mobile,
        rating: rating
    });
    
    // Update offers in localStorage
    offers = offers.map(o => o.id === offerId ? offer : o);
    localStorage.setItem('offers', JSON.stringify(offers));
    
    alert('Rating submitted successfully!');
    highlightStars(offerId, rating);
    
    // Update average rating display
    const avgRating = calculateAverageRating(offer.ratings);
    const avgRatingElement = document.querySelector(`#modalBody p strong`);
    if (avgRatingElement && avgRatingElement.textContent === 'Average Rating:') {
        avgRatingElement.parentElement.innerHTML = `<strong>Average Rating:</strong> ${avgRating} ⭐ (${offer.ratings.length} ratings)`;
    }
}

function getUserRating(offer) {
    if (!currentCustomer) return 0;
    
    const userRating = offer.ratings.find(r => r.customerMobile === currentCustomer.mobile);
    return userRating ? userRating.rating : 0;
}

function calculateAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return '0.0';
    
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / ratings.length;
    return avg.toFixed(1);
}

// Comments System
function displayComments(offer) {
    if (!offer.comments || offer.comments.length === 0) {
        return '<p style="color: #666;">No comments yet. Be the first to comment!</p>';
    }
    
    let commentsHTML = '';
    offer.comments.forEach(comment => {
        const isOwner = currentCustomer && comment.customerMobile === currentCustomer.mobile;
        const editDeleteButtons = isOwner ? `
            <button onclick="editComment($${offer.id},$$ {comment.id})">Edit</button>
            <button onclick="deleteComment($${offer.id},$$ {comment.id})">Delete</button>
        ` : '';
        
        commentsHTML += `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${comment.customerName}</span>
                    <div class="comment-actions">
                        ${editDeleteButtons}
                    </div>
                </div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-date" style="font-size: 12px; color: #666; margin-top: 5px;">${comment.date}</div>
            </div>
        `;
    });
    
    return commentsHTML;
}

function addComment(offerId) {
    if (!currentCustomer) {
        alert('Please login to comment!');
        return;
    }
    
    const commentText = document.getElementById(`commentText-${offerId}`).value.trim();
    
    if (!commentText) {
        alert('Please enter a comment!');
        return;
    }
    
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    const comment = {
        id: Date.now(),
        customerName: currentCustomer.name,
        customerMobile: currentCustomer.mobile,
        text: commentText,
        date: new Date().toLocaleString()
    };
    
    offer.comments.push(comment);
    
    // Update offers in localStorage
    offers = offers.map(o => o.id === offerId ? offer : o);
    localStorage.setItem('offers', JSON.stringify(offers));
    
    // Refresh comments display
    document.getElementById(`commentsContainer-${offerId}`).innerHTML = displayComments(offer);
    document.getElementById(`commentText-${offerId}`).value = '';
    
    // Update comment count
    document.querySelector(`#commentsContainer-${offerId}`).previousElementSibling.previousElementSibling.innerHTML = `<h3>Comments (${offer.comments.length})</h3>`;
}

function editComment(offerId, commentId) {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    const comment = offer.comments.find(c => c.id === commentId);
    if (!comment) return;
    
    if (comment.customerMobile !== currentCustomer.mobile) {
        alert('You can only edit your own comments!');
        return;
    }
    
    const newText = prompt('Edit your comment:', comment.text);
    
    if (newText !== null && newText.trim() !== '') {
        comment.text = newText.trim();
        comment.date = new Date().toLocaleString() + ' (edited)';
        
        // Update offers in localStorage
        offers = offers.map(o => o.id === offerId ? offer : o);
        localStorage.setItem('offers', JSON.stringify(offers));
        
        // Refresh comments display
        document.getElementById(`commentsContainer-${offerId}`).innerHTML = displayComments(offer);
    }
}

function deleteComment(offerId, commentId) {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    const comment = offer.comments.find(c => c.id === commentId);
    if (!comment) return;
    
    if (comment.customerMobile !== currentCustomer.mobile) {
        alert('You can only delete your own comments!');
        return;
    }
    
    if (confirm('Are you sure you want to delete this comment?')) {
        offer.comments = offer.comments.filter(c => c.id !== commentId);
        
        // Update offers in localStorage
        offers = offers.map(o => o.id === offerId ? offer : o);
        localStorage.setItem('offers', JSON.stringify(offers));
        
        // Refresh comments display
        document.getElementById(`commentsContainer-${offerId}`).innerHTML = displayComments(offer);
        
        // Update comment count
        const commentsHeader = document.querySelector(`#commentsContainer-${offerId}`).previousElementSibling.previousElementSibling;
        if (commentsHeader) {
            commentsHeader.innerHTML = `<h3>Comments (${offer.comments.length})</h3>`;
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Refresh data from storage
    owners = JSON.parse(localStorage.getItem('owners')) || [];
    offers = JSON.parse(localStorage.getItem('offers')) || [];
    currentOwner = JSON.parse(sessionStorage.getItem('currentOwner')) || null;
    currentCustomer = JSON.parse(sessionStorage.getItem('currentCustomer')) || null;
});
