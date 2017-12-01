//Constructor of the Class Product
var Product = function(name, price, imageUrl){
	this.name = name;
	this.price = price;
	this.imageUrl = imageUrl;
}
//calculate the total price of a product given the quantity
Product.prototype.computeNetPrice = function(quantity){
	return this.price * quantity;
}

//Global variable products(current), updated from the server.
var products = {};

//Global variable products(old), the number of each item is initialized to 5
var productsOld = {};

//Global variable cart, initialized as empty
var cart = {};
//Global variable inactiveTime
var inactiveTime = 0;
//maximum inactive time interval, second
var alertTime = 300;  

//after the window loaded
window.onload = function(){

	// fetch the up-to-date products info when window loads
	fetchProductsOnload();  
	fetchProductsWithFilters();

    //starts the timer, if no action, alerts every alertTime seconds
    timeCount();

    //setup Add buttons, for each add buttons, setup an add-listener
	var setupBtnAdd = document.getElementsByName("addItem");
	for(var i=0; i<setupBtnAdd.length; i++){
		setupBtnAdd[i].addEventListener("click", addProduct(), false);
	}

    //setup Remove buttons, for each add buttons, setup an remove-listener
	var setupBtnRemove = document.getElementsByName("removeItem");
	for(var i=0; i<setupBtnRemove.length; i++){
		setupBtnRemove[i].addEventListener("click", removeProduct(), false);
	}

    //setup the cart button
    var setupBtnCart = document.getElementById("shopcart");
    setupBtnCart.addEventListener("click", showCart(), false);

    //setup the the checkout button
    var checkout = document.getElementById("checkout");  
	//checkout.addEventListener("click", ajaxGet(url1, successCallback, errorCallback), false);
	checkout.addEventListener("click", checkOut(checkoutUrl, checkCart, fetchProductsCheckout), false);

    //add event listeners for the table buttons in the modal
    var tableidd = document.getElementById("tableid");
    for (var i = 1; i < tableidd.rows.length; i++) {
			var roww = tableidd.rows[i].cells;
			var add = roww[2].firstChild;
			add.addEventListener("click", addProduct(), false);
			var rmv = roww[3].firstChild;
			rmv.addEventListener("click", removeProduct(), false);
	}

	updatePagePrice();
   
}

//the main Add-Item function
var addProduct = function(){  
	return function(event){
		//when user clicks the add button, reset the timer
		resetTimer();
		//each button has its value as the product name in html
	    var productName = event.srcElement.value;
	    addToCart(productName);
	    //update the price shown on the cart button
	    updateCartPrice();
	    //update the add/remove button status
	    updateButtonStatus(); 

	    //refresh the total price in the modal
	    var totalPriceBtn = document.getElementById("totalPrice");
		var totalprice = calcuCartPrice();
		totalPriceBtn.innerHTML = "Total Price: $" + totalprice;
	}	
}

//update the cart when add products, invoked by the main Add-Item function
var addToCart = function(name){
	//used to tell the updateProducts() it is an add action
	var signal = -1;
	//when adding to cart, check and update the stock first
	//if there is still items in stock, finish the add action and update the cart, 
	//otherwise alert in the updateProducts()   
	var sig2 = updateProducts(name, signal);
	//if the product was in cart, add the num, otherwise creat a new key-value pair
	if(sig2 == true){
		if(name in cart){
		    cart[name] += 1;
	    }else{
		    cart[name] = 1;
	    }
	    //refresh the quantity of the product in the modal table
		var tableidd = document.getElementById("tableid");
		tableidd.style.display = "block";
		for (var i = 1; i < tableidd.rows.length; i++) {
			var roww = tableidd.rows[i].cells;
			if (roww[0].innerHTML == name) {
				roww[1].innerHTML = cart[name];
			}
		}
	}
	
}

//the main Remove-Item function
var removeProduct = function(){
	return function(event){
		//when user clicks the remove button, reset the timer
		resetTimer();
		//each button has its value as the product name in html
	    var productName = event.srcElement.value;
	    removeFromCart(productName);
	    //update the price shown on the cart button
	    updateCartPrice();
	    //update the add/remove button status
	    updateButtonStatus();

	    //refresh the total price in the modal
	    var totalPriceBtn = document.getElementById("totalPrice");
		var totalprice = calcuCartPrice();
		totalPriceBtn.innerHTML = "Total Price: $" + totalprice;          
	}
}

//update the cart when remove products, invoked by the main Remove-Item function
var removeFromCart = function(name){
	//used to tell the updateProducts() it is a remove action
	var signal = 1;
	//sig2 is used to judge if the item was in the cart
	var sig2 = true;
	//if the item was in the cart, remove it, otherwise alert
	if(name in cart){
		cart[name] -= 1;
	}else{
		alert(name + " does not exist in the cart.");
		sig2 = false;
	}
	
	//if the item was in the cart, finish the remove action and update the products
	if(sig2 == true){
		updateProducts(name, signal);
		//refresh the quantity of the product in the modal table
		var tableidd = document.getElementById("tableid");
		tableidd.style.display = "block";

		for (var i = 1; i < tableidd.rows.length; i++) {
			var roww = tableidd.rows[i].cells;
			if (roww[0].innerHTML == name) {
				roww[1].innerHTML = cart[name];
                //if the quantity of the product comes to 0, delete the info in that line
				if (roww[1].innerHTML == 0) {
					roww[0].innerHTML = "";
					roww[1].innerHTML = "";

					//deactivate the add button in the modal
					var add = roww[2].firstChild;
				  	add.value = "";
				    //deactivate the remove button in the modal
				    var rmv = roww[3].firstChild;
				    rmv.value = "";
				}
				break;
			}
		}
	}
	//if the num of the item has been subtracted to 0, delete the item from the cart
	if(cart[name] == 0){
		delete cart[name];
	}	
}

//update the products, decide to add or remove the item according to the signal
var updateProducts = function(productName, signal){
    //if the item was in stock, add or remove it from the stock, if it is not in stock,
    //and it is an remove action, show alert
	if(productsOld[productName].quantity == 0 && signal == -1){
		alert("There is no more "+ productName + " in stock.");
		return false;
	}else{
		productsOld[productName].quantity += signal;
	}
	return true;
}

//displays the items and its num in the cart in the alert window
var showCart = function(){
	return function(){
		//when user clicks the cart button, reset the inactive time
		resetTimer();

		//event.srcElement.textContent = "Cart($" + totalPrice + ")";
		var modal = document.getElementById('myModal');
    	modal.style.display = "block";

    	// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];
    	span.onclick = function() {
    		modal.style.display = "none";
		}

		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function(event) {
    		if (event.target == modal) {
        		modal.style.display = "none";
    		}
		}

		// When the user press the esc key, close the modal
		document.onkeydown = function(event){  
            if(event.keyCode == 27){ 
            	modal.style.display = "none";
            }
        }

		var tableid = document.getElementById("tableid");
		tableid.style.display = "block";		

		//clean the table first
		for (var i = 1; i < tableid.rows.length; i++) {
			var roww = tableid.rows[i].cells;
			roww[0].innerHTML = "";
		    roww[1].innerHTML = "";
			var add = roww[2].firstChild;
			add.value = "";
			var rmv = roww[3].firstChild;
			rmv.value = "";
		}
		
		//fill the table acording to the productlist in cart
		var keys = Object.keys(cart);
		for (var i = 0; i < keys.length; i++) {
			var row = tableid.rows[i+1].cells;
			row[0].innerHTML = keys[i];
			row[1].innerHTML = cart[keys[i]];

			//activate the add button in the modal
			var add = row[2].firstChild;
            add.value = keys[i];
			//activate the remove button in the modal
			var rmv = row[3].firstChild;
			rmv.value = keys[i];
		}
        //refresh the total price in the modal
		var totalPriceBtn = document.getElementById("totalPrice");
		var totalprice = calcuCartPrice();
		totalPriceBtn.innerHTML = "Total Price: $" + totalprice;
        //add a checkout button
		var checkout = document.getElementById("checkout");
		checkout.style.display = "block";
		tableID.appendChild(checkout);

	}
}

//Global timer, setup a setTimeout timer every 1 second to time the inactiveTime,
//when the inactiveTime adds to alertTime, give the alert
var timeCount = function(){
	if(inactiveTime >= alertTime){
		alert("Hey there! Are you still planning to buy something?");
		resetTimer();
	}
	inactiveTime += 1;
	updateFooterTime();
	var t = setTimeout("timeCount()", 1000)
}

//reset the Global timer by setting the inactive time to 0
var resetTimer = function(){
	inactiveTime = 0;
	updateFooterTime();
}

//Caculate the total price in the cart
var calcuCartPrice = function(){
	var price = 0;
	for(var key in cart){
		price += productsOld[key].product.computeNetPrice(cart[key]);
	}
	return price;
}

//update the price shown on the cart button
var updateCartPrice = function(){
	var newTotal = calcuCartPrice();
	var p = document.getElementById("shopcart");
	p.innerHTML = '<img src="images/cart.png">Cart($' +newTotal+ ')';
}

//update the time within the footer
var updateFooterTime = function(){
	var t = document.getElementById("timer");
	t.innerHTML = inactiveTime;
}

//update button status : show/hide
var updateButtonStatus = function(){
	//update the add button, if the product is out of stock, hide the add button
	var btnAdd = document.getElementsByName("addItem");
	for(var i=0; i<btnAdd.length; i++){
		if(productsOld[btnAdd[i].value].quantity == 0){
			btnAdd[i].style.display = "none";
			btnAdd[i].previousSibling.nodeValue = 'Out of Stock';
		}else{
			btnAdd[i].style.display = "block";
			btnAdd[i].previousSibling.nodeValue = '';
		}
	}
	//update the remove button, if the product is not in the cart, hide the remove button
	var btnRem = document.getElementsByName("removeItem");
	for(var i=0; i<btnRem.length; i++){
		if(btnRem[i].value in cart){
			btnRem[i].style.display = "block";
		}else{
			btnRem[i].style.display = "none";
		}
	}

}

//update the price and quantity of items in cart, update the price shown in modal and cart button, and 
//update the status of add/remove buttons on the page
var checkCart = function(){
	if(Object.keys(cart).length == 0){
		alert("The cart is empty.");
		return;
	}

	updatePriceQuantity();

	//refresh the total price in the modal
	var totalPriceBtn = document.getElementById("totalPrice");
	var totalprice = calcuCartPrice();
	totalPriceBtn.innerHTML = "Total Price: $" + totalprice;

	//update the price shown on the cart button
	updateCartPrice();
	//update the add/remove button status
	updateButtonStatus();
	//update the prince shown on page
	updatePagePrice();

}
//update the price and quantity of items both in cart and in productsOld, and refresh the table in modal
var updatePriceQuantity = function(){
	//compare the items in the cart with those from the server and update the cart
	for(var item in cart){
		//update quantity of each item in cart.
		//if the quantity is 0, do not need to check the price.
		if(products[item].quantity == 0){
			alert("The " + item + " is out of stock.");
			delete cart[item];
			productsOld[item].quantity = 0;
			continue;
		}else if(cart[item] > products[item].quantity){
			alert("The quantity of " + item + " has changed from " + cart[item]
				+ " to " + products[item].quantity + " due to limited stock.");
			cart[item] = products[item].quantity;
			productsOld[item].quantity = 0;
		}else{
			productsOld[item].quantity = products[item].quantity - cart[item];
		}
		//update the quantity for each item
		if(productsOld[item].product.price != products[item].product.price){
	
			//upate the item price for the cart
			productsOld[item].product.price = products[item].product.price;
		}
	}

	//update price and quantity of othe items in productsOld
	for (var item in products){
		//items in cart have been updated before
		if(item in cart){continue;}
        //update quantity and price
		productsOld[item].quantity = products[item].quantity;
		productsOld[item].product.price = products[item].product.price;

	}

	//update the table in the modal
	var tableid = document.getElementById("tableid");
	tableid.style.display = "block";

	//clean the table first
	for (var i = 1; i < tableid.rows.length; i++) {
		var roww = tableid.rows[i].cells;
		roww[0].innerHTML = "";
	    roww[1].innerHTML = "";
		var add = roww[2].firstChild;
		add.value = "";
		var rmv = roww[3].firstChild;
		rmv.value = "";
	}
	
	//fill the table acording to the productlist in cart
	var keys = Object.keys(cart);
	for (var i = 0; i < keys.length; i++) {
		var row = tableid.rows[i+1].cells;
		row[0].innerHTML = keys[i];
		row[1].innerHTML = cart[keys[i]];

		//activate the add button in the modal
		var add = row[2].firstChild;
        add.value = keys[i];
		//activate the remove button in the modal
		var rmv = row[3].firstChild;
		rmv.value = keys[i];
	}
	
}

//update the price shown on images on the page
var updatePagePrice = function(){

	var productPage = document.querySelectorAll("#productList span>img");

	for(var i=0; i<productPage.length; i++){
		if(productPage[i].nextSibling.nodeType == 3){
			var name = productPage[i].parentNode.querySelector("button").value;
			if(name in products){
				productPage[i].nextSibling.nodeValue = "$ " + products[name].product.price.toFixed(2);
			}
		}
	}
}

// Assignment 5
var token = "Xoe2inasd";
var lowPrice = 10, highPrice = 100;
var category = "All Items";  
category = (category === "All Items") ? null : category;  


//update the local ProdcutsOld at the beginning of onload
var updateLocalProducts = function(){
	productsOld = {};
	for(name in products){
		var item = products[name];
		productsOld[name] = {};
		productsOld[name].product = new Product(item.product.name, item.product.price, item.product.imageUrl);
		productsOld[name].quantity = item.quantity;

	}
}
//update the products by info from the server
var updateProductsFromServer = function(response){
	products = {};
	for(var i = 0; i < response.length; i++){
		var item = response[i];
		products[item.name] = {};
		products[item.name].product = new Product(item.name, item.price, item.imageUrl);
		products[item.name].quantity = item.quantity;

	}
	updatePagePrice();	
}

// fetch all the products (initilize products when open/refresh webpage without filters )
function fetchProductsOnload() {		 

	var reqUrl = "http://localhost:5000/products?lowprice=&highprice=&token="+token;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", reqUrl);
	xhr.setRequestHeader('content-type', 'application/json');
	xhr.onload = function() {
		if (xhr.status == 200) {
			updateProductsFromServer(JSON.parse(xhr.responseText));
			updateLocalProducts();
			//hide the remove buttons
    		updateButtonStatus();	
		}
	}
	xhr.send();
	xhr.onerror = function() {
		console.log("error occurred on request");
	}
}

// fetch all the products (initilize products when open/refresh webpage without filters )
function fetchProductsCheckout(reqUrlPost, checkCartCallback) {		 

	var reqUrl = "http://localhost:5000/products?lowprice=&highprice=&token="+token;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", reqUrl);
	xhr.setRequestHeader('content-type', 'application/json');
	xhr.onload = function() {
		if (xhr.status == 200) {
			//after the request succeeds, update the products
			updateProductsFromServer(JSON.parse(xhr.responseText));
			// check if items in cart is available, then send the cart data
			checkCartCallback();
			//send a post requst, including the cart and price data to the server
			xhrPost(reqUrlPost);
			//after the user click checkout, clear the modal and shut it down
			finishCheckout();
		}
	}
	xhr.send();
	xhr.onerror = function() {
		console.log("error occurred on request");
	}
}

// fetch the products based on filters (only show on the server side or console)
function fetchProductsWithFilters() {		

	var reqUrl = "http://localhost:5000/products?lowprice="+lowPrice+"&highprice="+highPrice+"&token="+token+"&category="+category; 
	var xhr = new XMLHttpRequest();
	xhr.open("GET", reqUrl);
	xhr.setRequestHeader('content-type', 'application/json');
	xhr.onload = function() {
		if (xhr.status == 200) {
			//console.log(JSON.parse(xhr.responseText));		
		} else {
			console.log("error");
		}
	}
	xhr.send();
	xhr.onerror = function() {
		console.log("error occurred on request");
	}
}

// checkout request 
var checkoutUrl = "http://localhost:5000/checkout?token="+token;
var checkOut = function(reqUrl, checkCartCallback, updateProductsCallback){
	
	var CheckoutRequest = function(){
		// update products, check items in the cart and send the cart data to the server
		updateProductsCallback(reqUrl, checkCartCallback);			
		
	}
	return CheckoutRequest;	
}

var xhrPost = function(reqUrl){
	var totalprice = calcuCartPrice(); 
	var data = {cart: cart, total: totalprice};  //orders
	var xhr = new XMLHttpRequest();
	xhr.open("POST", reqUrl);
	xhr.setRequestHeader('content-type', 'application/json');
	xhr.onload = function() {
		if (xhr.status == 200) {		
			// the local productsOld had updated before checkout, so no need to update it again
			//Do not need to do anything here 		

		} else {
			console.log("error");
		}
	}
	xhr.send(JSON.stringify(data));
	xhr.onerror = function() {
		console.log("error occurred on request");
	}

}
//after the user click checkout, clear the modal and shut it down 
var finishCheckout = function(){
	//shows an alert
	alert("You've checked out. Thank you! \n \n Now you can pick other products.");
	//clear the cart and refresh the cart price
	cart = {};
	//update the price shown on the cart button
	updateCartPrice();
	//clear the modal and clear the table
	var tableid = document.getElementById("tableid");
	tableid.style.display = "block";
	//clean the table
	for (var i = 1; i < tableid.rows.length; i++) {
		var roww = tableid.rows[i].cells;
		roww[0].innerHTML = "";
	    roww[1].innerHTML = "";
		var add = roww[2].firstChild;
		add.value = "";
		var rmv = roww[3].firstChild;
		rmv.value = "";
	}
	//refresh the total price in the modal
	var totalPriceBtn = document.getElementById("totalPrice");
	var totalprice = calcuCartPrice();
	totalPriceBtn.innerHTML = "Total Price: $" + totalprice;
	//shut down the modal
	var modal = document.getElementById('myModal');
	modal.style.display = "none";
}
