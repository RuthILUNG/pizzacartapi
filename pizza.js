document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => {
        return {

            title: 'pizza cart API',
            pizzas: [],
            Username:'',
            cartId :'',
            cartTotal:0.00,
            cartPizzas:[],
            change: 0.00,
            message: '',
            showHistory: false,
            history: [],
            featuredPizzas: [],
            cartVisible: false,
            paymentAmount: 0,
            login() {
                if (this.Username.length > 2) {
                    localStorage['username'] = this.Username;
                    this.createCart();
                }
                else {
                    alert('Username should be contain more than three characters')
                }
            },

            logout() {
                if (confirm("You are about to logout, click 'OK' to proceed.")) {
                    this.Username = '';
                    this.cartId = '';
                    this.showCart = false;
                    localStorage[''] = 'cartId';
                    localStorage['Username'] = '';
                }
            },
            createCart() {
                if (!this.Username) {
                    return Promise.resolve();
                }

                const cartId = localStorage['cartId'];
                if (cartId) {
                    this.cartId = cartId;
                    return Promise.resolve();
                } else {
                    const createCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.Username}`;
                    return axios.get(createCartUrl)
                        .then(result => {
                            this.cartId = result.data.cart_code;
                            localStorage['cartId'] = this.cartId;
                        });
                }
            },

            getcart()
                {
                    const getcarturl='https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get'
                    return axios.get(getcarturl);

                },
                addingPizza(pizzaID) {
                    return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                        "cart_code": this.cartId,
                        "pizza_id": pizzaID
                    });
                },
                removingPizza(pizzaID) {
                    const removingURL = 'https://pizza-api.projectcodex.net/api/pizza-cart/remove'
                    return axios.post(removingURL, {
                        "cart_code": this.cartId,
                        "pizza_id": pizzaID
                    })
                },
                payment(amount) {
                    const payUrl = 'https://pizza-api.projectcodex.net/api/pizza-cart/pay'
                    return axios.post(payUrl, {
                        "cart_code": this.cartId,
                        amount
                    });
                },
                calculateChange() {
                    this.change = (this.paymentAmount - this.cartTotal).toFixed(2);
                },
    
            
                showCartData(){
                this.getcart().then( result => {
                    const cartdata=result.data;
                    this.cartPizzas=cartdata.pizzas;
                    this.cartTotal= cartdata.total;
                    this.calculateChange();
                    //this.cartPizzas = result.data.pizzas
                    //alert(this.cartTotal);
                    //alert(this.cartdata);
                    
               });

            },
                   
            
               
                

            init() 
            {
                axios
                    .get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        //console.log(result.data);
                        this.pizzas = result.data.pizzas

                    })
                    .catch(error => {
                        console.error("Error fetching pizzas:", error);
                    });

                const user = localStorage.getItem('username');
                if (user) {
                    this.Username = user;
                    this.createCart().then(() => {
                        this.showCartData();
                        
                    });
                }
                    
                
                   
                
                
    

            },
            addpizzatocart(pizzaId){
                //alert(pizzaId)
                this
                .addingPizza(pizzaId)
                .then(() =>{
                    
                        this.showCartData();
                        this.cartVisible = true;

                })

            },
            removepizzatocart(pizzaId){
                this
                .removingPizza(pizzaId)
                .then(() =>{
                    
                        this.showCartData();

                })
                
            },
            setFeaturedPizza(pizzaId) {
                axios.post('https://pizza-api.projectcodex.net/api/pizzas/featured', {
                    "username": this.Username,
                    "pizza_id": pizzaId
                }).then(() => {
                    this.getFeaturedPizzas();
                });
            },
            getFeaturedPizzas() {
                const url = `https://pizza-api.projectcodex.net/api/pizzas/featured?username=${this.Username}`;
                axios.get(url).then(result => {
                    this.featuredPizzas = result.data.pizzas;
                });
            },
            pay(amount) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                    "cart_code": this.cartId,
                    amount
                });
            },
            payForCart() {
                

                this.pay(this.paymentAmount).then(result => {
                    if (result.data.status === 'failure') {
                        this.message = result.data.message;
                        setTimeout(() => this.message = '', 3000);
                    } else {
                        this.message = 'Payment received!';
                        setTimeout(() => {
                            this.message = '';
                            this.cartPizzas = [];
                            this.cartTotal = 0.00;
                            this.paymentAmount = 0;
                            this.change = 0.00;

                            localStorage['cartId'] = '';
                            this.cartId = '';
                            this.cartVisible = false;

                            this.createCart().then(() => {
                                this.showCartData();
                                
                            });
                        }, 3000);
                    }
                });
            },

           
        }



        

    });

});