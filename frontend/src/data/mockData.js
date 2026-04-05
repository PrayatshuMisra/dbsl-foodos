// Mock data to replace backend API calls
export const mockRestaurants = [
  {
    restaurant_id: 1,
    name: "Burger Palace",
    cuisine: "American",
    rating: 4.5,
    delivery_time: "25-35 min",
    min_order: 200,
    img_src: "/assets/restos/burger1.jpeg",
    location: "Downtown, City",
    address: "123 Main Street, Downtown",
    contact_number: "+1 555-0123"
  },
  {
    restaurant_id: 2,
    name: "Pizza Express",
    cuisine: "Italian",
    rating: 4.3,
    delivery_time: "30-40 min",
    min_order: 300,
    img_src: "/assets/restos/pizza1.jpeg",
    location: "Westside, City",
    address: "456 Oak Avenue, Westside",
    contact_number: "+1 555-0124"
  },
  {
    restaurant_id: 3,
    name: "Chinese Wok",
    cuisine: "Chinese",
    rating: 4.7,
    delivery_time: "20-30 min",
    min_order: 250,
    img_src: "/assets/restos/chinese1.jpeg",
    location: "Chinatown, City",
    address: "789 Pine Street, Chinatown",
    contact_number: "+1 555-0125"
  },
  {
    restaurant_id: 4,
    name: "North Indian Kitchen",
    cuisine: "North Indian",
    rating: 4.6,
    delivery_time: "25-35 min",
    min_order: 180,
    img_src: "/assets/restos/north1.jpeg",
    location: "Eastside, City",
    address: "321 Elm Street, Eastside",
    contact_number: "+1 555-0126"
  },
  {
    restaurant_id: 5,
    name: "Sweet Dreams",
    cuisine: "Desserts",
    rating: 4.4,
    delivery_time: "15-25 min",
    min_order: 150,
    img_src: "/assets/restos/cake1.jpeg",
    location: "Central, City",
    address: "654 Maple Drive, Central",
    contact_number: "+1 555-0127"
  }
];

export const mockDishes = {
  1: [ // Burger Palace menu
    {
      dish_id: 1,
      name: "Classic Cheeseburger",
      price: 250,
      description: "Juicy beef patty with cheese, lettuce, and special sauce",
      img_src: "/assets/dishes/burger1.jpg",
      category: "Burgers",
      rating: 4.5
    },
    {
      dish_id: 2,
      name: "Chicken Burger",
      price: 220,
      description: "Grilled chicken with fresh vegetables",
      img_src: "/assets/dishes/burger2.jpg",
      category: "Burgers",
      rating: 4.3
    }
  ],
  2: [ // Pizza Express menu
    {
      dish_id: 3,
      name: "Margherita Pizza",
      price: 350,
      description: "Classic tomato sauce with mozzarella cheese",
      img_src: "/assets/dishes/pizza1.jpg",
      category: "Pizza",
      rating: 4.4
    },
    {
      dish_id: 4,
      name: "Pepperoni Pizza",
      price: 400,
      description: "Spicy pepperoni with melted cheese",
      img_src: "/assets/dishes/pizza2.jpg",
      category: "Pizza",
      rating: 4.6
    }
  ],
  3: [ // Chinese Wok menu
    {
      dish_id: 5,
      name: "Kung Pao Chicken",
      price: 280,
      description: "Spicy diced chicken with peanuts and vegetables",
      img_src: "/assets/dishes/chinese1.jpg",
      category: "Chinese",
      rating: 4.7
    },
    {
      dish_id: 6,
      name: "Sweet and Sour Pork",
      price: 260,
      description: "Crispy pork in tangy sauce",
      img_src: "/assets/dishes/chinese2.jpg",
      category: "Chinese",
      rating: 4.5
    }
  ],
  4: [ // North Indian Kitchen menu
    {
      dish_id: 7,
      name: "Butter Chicken",
      price: 320,
      description: "Creamy tomato-based curry with tender chicken",
      img_src: "/assets/dishes/north1.jpg",
      category: "North Indian",
      rating: 4.8
    },
    {
      dish_id: 8,
      name: "Paneer Tikka",
      price: 280,
      description: "Grilled cottage cheese with Indian spices",
      img_src: "/assets/dishes/north2.jpg",
      category: "North Indian",
      rating: 4.6
    }
  ],
  5: [ // Sweet Dreams menu
    {
      dish_id: 9,
      name: "Chocolate Cake",
      price: 180,
      description: "Rich chocolate cake with chocolate ganache",
      img_src: "/assets/dishes/cake1.jpg",
      category: "Desserts",
      rating: 4.4
    },
    {
      dish_id: 10,
      name: "Red Velvet Cake",
      price: 200,
      description: "Classic red velvet with cream cheese frosting",
      img_src: "/assets/dishes/cake2.jpg",
      category: "Desserts",
      rating: 4.5
    }
  ]
};

export const mockUser = {
  user_id: "user123",
  name: "John Doe",
  mobile_number: "+91 98765 43210",
  address: "123 Main Street, City, State 12345",
  img_src: "https://api.dicebear.com/9.x/big-smile/svg?seed=123"
};

export const mockOrders = [
  {
    ORDER_ID: "order001",
    ORDER_DATE: "2024-01-15",
    TOTAL_AMOUNT: 750,
    STATUS: "Delivered",
    items: [
      {
        ORDER_DETAIL_ID: 1,
        NAME: "Classic Cheeseburger",
        SUBTOTAL_AMOUNT: 250,
        QUANTITY: 2
      },
      {
        ORDER_DETAIL_ID: 2,
        NAME: "Chicken Burger",
        SUBTOTAL_AMOUNT: 220,
        QUANTITY: 1
      }
    ]
  },
  {
    ORDER_ID: "order002",
    ORDER_DATE: "2024-01-10",
    TOTAL_AMOUNT: 680,
    STATUS: "Delivered",
    items: [
      {
        ORDER_DETAIL_ID: 3,
        NAME: "Margherita Pizza",
        SUBTOTAL_AMOUNT: 350,
        QUANTITY: 1
      },
      {
        ORDER_DETAIL_ID: 4,
        NAME: "Chocolate Cake",
        SUBTOTAL_AMOUNT: 180,
        QUANTITY: 1
      }
    ]
  }
];

export const mockCart = [
  {
    ORDER_DETAIL_ID: 1,
    NAME: "Classic Cheeseburger",
    SUBTOTAL_AMOUNT: 250,
    QUANTITY: 2
  },
  {
    ORDER_DETAIL_ID: 2,
    NAME: "Chicken Burger",
    SUBTOTAL_AMOUNT: 220,
    QUANTITY: 1
  }
];

// Mock search results
export const searchDishes = (query) => {
  const allDishes = Object.values(mockDishes).flat();
  return allDishes.filter(dish => 
    dish.name.toLowerCase().includes(query.toLowerCase()) ||
    dish.category.toLowerCase().includes(query.toLowerCase())
  );
};

// Mock authentication
export const mockAuth = {
  login: (name, password) => {
    if (name === "demo" && password === "demo") {
      return { success: true, user: mockUser };
    }
    return { success: false, message: "Invalid credentials" };
  },
  register: (name, mobileNumber, password) => {
    return { success: true, user: { ...mockUser, name, mobile_number: mobileNumber } };
  },
  logout: () => {
    return { success: true };
  }
}; 