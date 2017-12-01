db.products.insert(
  [ 
    {
      "name":"KeyboardCombo",
      "price":25,
      "quantity":10,
      "category": "Tech",
      "imageUrl":"http://localhost/public/images/KeyboardCombo.png"
    },
  
    {
      "name":"Mice",
      "price":7,
      "quantity":10,
      "category": "Tech",
      "imageUrl":"http://localhost/public/images/Mice.png"
    },

    {
      "name":"PC1",
      "price":326,
      "quantity":10,
      "category": "Tech",
      "imageUrl":"http://localhost/public/images/PC1.png"
    },

    {
      "name":"PC2",
      "price":398,
      "quantity":10,
      "category": "Tech",
      "imageUrl":"http://localhost/public/images/PC2.png"
    },

    {
      "name":"PC3",
      "price":338,
      "quantity":10,
      "category": "Tech",
      "imageUrl":"http://localhost/public/images/PC3.png"
    },

    {
      "name":"Tent",
      "price":32,
      "quantity":10,
      "category": "Supplies",
      "imageUrl":"http://localhost/public/images/Tent.png"
    },

    {
      "name":"Box1",
      "price":5,
      "quantity":10,
      "category": "Supplies",
      "imageUrl":"http://localhost/public/images/Box1.png"
    },

    {
      "name":"Box2",
      "price":7,
      "quantity":10,
      "category": "Supplies",
      "imageUrl":"hhttp://localhost/public/images/Box2.png"
    },

    {
      "name":"Clothes1",
      "price":20,
      "quantity":10,
      "category": "Clothing",
      "imageUrl":"http://localhost/public/images/Clothes1.png"
    },

    {
      "name":"Clothes2",
      "price":29,
      "quantity":10,
      "category": "Clothing",
      "imageUrl":"http://localhost/public/images/Clothes2.png"
    },

    {
      "name":"Jeans",
      "price":32,
      "quantity":10,
      "category": "Clothing",
      "imageUrl":"http://localhost/public/images/Jeans.png"
    },

    {
      "name":"Keyboard",
      "price":17,
      "quantity":10,
      "category": "Supplies",
      "imageUrl":"http://localhost/public/images/Keyboard.png"
    }
  ]
);


db.orders.insert(
  {
    "cart" : "JsonStringForCartObject",
    "total" : 117
  }
);


db.users.insert(
  [
    {
      "token" : "Xoe2inasd"
    }, 

    {
      "token" : "Xoe4inase"
    }, 

    {      
      "token" : "Xoe6inasf"
    }
  ]
);