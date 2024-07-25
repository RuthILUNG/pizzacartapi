document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCartWithAPIWidget', () => {
        return {
            title: 'PLACE YOUR PIZZA ORDER',
            pizzas: [],
            username: '',
            cartID: '',
            cartPizzas: [],
            featuredpizzas: [],
            totalCost: 0.00,
            money: 0,
            message: '',
            historyCartsIds: [],
            pastOrderedPizzas: [],
            displayHistory: false,
            payNow: false,
            showCart: false,
            viewCart: false,
            change: 0,

            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();
                }
                else {
                    alert('Username should be contain more than three characters')
                }
            },

            logout() {
                if (confirm("You are about to logout, click 'OK' to proceed.")) {
                    this.username = '';
                    this.cartID = '';
                    this.showCart = false;
                    localStorage['cartID'] = '';
                    localStorage['username'] = '';
                }
            },

            createCart() {
                if (!this.username) {
                    this.cartID = ''
                    return Promise.resolve();
                }
                const cartCreationUrl = https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}
                const cartID = localStorage['cartID'];
                if (cartID) {
                    this.cartID = cartID;
                    return Promise.resolve();
                }
                else {
                    return axios.get(cartCreationUrl)
                        .then(result => {
                            this.cartID = result.data.cart_code;
                            localStorage['cartID'] = this.cartID;
                        })
                }
            },

            getCart() {
                const getCartUrl = https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartID}/get
                return axios.get(getCartUrl);
            },

            addingPizza(pizzaID) {
                const addingURL = 'https://pizza-api.projectcodex.net/api/pizza-cart/add'
                return axios.post(addingURL, {
                    "cart_code": this.cartID,
                    "pizza_id": pizzaID
                })
            },

            removingPizza(pizzaID) {
                const addingURL = 'https://pizza-api.projectcodex.net/api/pizza-cart/remove'
                return axios.post(addingURL, {
                    "cart_code": this.cartID,
                    "pizza_id": pizzaID
                })
            },

            payment(amount) {
                const payUrl = 'https://pizza-api.projectcodex.net/api/pizza-cart/pay'
                return axios.post(payUrl, {
                    "cart_code": this.cartID,
                    amount
                });
            },

            showCartCost() {
                this.getCart().then(result => {
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.totalCost = cartData.total.toFixed(2);
                });
            },

            pizzaImage(pizza) {
                return ./images/${pizza.size}.webp
            },

            featuredPizzas() {
                axios.get('https://pizza-api.projectcodex.net/api/pizzas/featured?username=Xolisile')
                    .then(result => {
                        this.featuredpizzas = result.data.pizzas
                    }
                    )
            },

            postfeaturedPizzas() {
                axios.post('https://pizza-api.projectcodex.net/api/pizzas/featured', {
                    username: 'Xolisile',
                    pizza_id: pizzaId
                }).then(() => this.featuredPizzas());
            },

            init() {
                const storedUsername = localStorage['username']
                if (storedUsername) {
                    this.username = storedUsername;
                }
                axios
                    .get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        this.pizzas = result.data.pizzas
                    })
                    .then(() => {
                        return this.featuredPizzas();
                    });

                if (!this.cartID) {
                    this
                        .createCart()
                        .then(() => {
                            this.showCartCost();
                        })
                }
                this.featuredPizzas()
            },
            add(pizzaID) {
                this.addingPizza(pizzaID)
                    .then(() => {
                        this.showCartCost();
                    })
                    .then(() => {

                        return this.featuredPizzas();

                    })
                    .then(() => {
                        return this.postfeaturedPizzas();
                    })
            },
            remove(pizzaID) {
                this.removingPizza(pizzaID)
                    .then(() => {
                        this.showCartCost();
                    })
            },
            orderHistory() {

                const orderHistoryUrrl = https://pizza-api.projectcodex.net/api/pizza-cart/username/${this.username}
                axios.get(orderHistoryUrrl).then(
                    result => {

                        this.historyCartsIds = result.data.filter(cart => cart.status === 'paid');
                        this.activateDisplayHistory();
                    }
                )

            },
            historyPizzas() {
                this.orderHistory();
                this.orderHistory();
            },
            getPastOrders(CartCode) {

                const getCartUrl = https://pizza-api.projectcodex.net/api/pizza-cart/${CartCode}/get;
                return axios.get(getCartUrl)
                    .then(result => {

                        this.pastOrderedPizzas.push({ 'pizzas': result.data.pizzas, 'total': result.data.total, 'cartId': result.data.id });

                    })


            },
            activateDisplayHistory() {
                this.displayHistory = true;
                this.cartDisplayed = true;
            },
            newOrder() {
                this.displayHistory = false;
                this.cartDisplayed = false;
            },

            pay() {
                this.payment(this.money)
                    .then(result => {
                        if (result.data.status == 'failure') {
                            this.message = result.data.message;
                            setTimeout(() => this.message = '', 5000);
                        }
                        else if (result.data.status == 'success') {
                            this.change = this.money - this.totalCost
                            this.message = result.data.message + ' Your change is R' + this.change.toFixed(2)

                            setTimeout(() => {
                                this.cartID = '';
                                this.cartPizzas = [];
                                this.totalCost = 0.00;
                                this.money = 0;
                                this.message = '';
                                localStorage['cartID'] = '';
                                this.createCart()
                            }, 5000)
                        }
                    })
            }
        }
    }):
});