
import { User, CartItem, Item } from '../stores';
import { BrowserHeaders } from 'browser-headers';
import { ShoppingCartClient, ServiceError } from '../_proto/shoppingcart_pb_service';
import { AddLineItem, RemoveLineItem, GetShoppingCart, Cart } from '../_proto/shoppingcart_pb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
export class Api{
    store: any = null;

    // Setup cart client
    cart_host = (process.env.CART_SCHEME && process.env.CART_HOST && process.env.CART_PORT) ?
        process.env.CART_SCHEME + "://" + process.env.CART_HOST + ":" + process.env.CART_PORT :
        window.location.protocol + "//"+window.location.hostname + (window.location.hostname == "localhost" ? ":" + window.location.port : "");

    cart_client = new ShoppingCartClient(this.cart_host);

    setHostname = (hostname:string) => {
        this.cart_client = new ShoppingCartClient(hostname);
    }

    setStore = (store) => {
        this.store = store;
    }

    addItem = (user: User, item: Item, quantity: number) => {
        const addItem = new AddLineItem();
        addItem.setName(item.name);
        addItem.setProductId(item.id);
        addItem.setQuantity(quantity);
        addItem.setUserId(user.name);
        const metadata = new BrowserHeaders({'x-custom-header-1': 'example'});

        return new Promise<void>( (resolve, reject) => {
            this.cart_client.addItem(addItem, metadata,(err: ServiceError, response: Empty) => {
                console.log("err", err);
                if(err)reject(err);
                else resolve();
            });
        });
    }

    removeItem = (user: User, item: Item, quantity: number) => {
        const remItem = new RemoveLineItem();
        remItem.setProductId(item.id);
        remItem.setUserId(user.name);
        const metadata = new BrowserHeaders({'x-custom-header-1': 'example'});
        return new Promise<void>( (resolve, reject) => {
            this.cart_client.removeItem(remItem, metadata,(err: ServiceError, response: Empty) => {
                console.log("err", err);
                if(err)reject(err);
                else resolve();
            });
        });
    }

    getCart = (user: User)  => {
        const get = new GetShoppingCart();
        const metadata = new BrowserHeaders({'x-custom-header-1': 'example'});
        get.setUserId(user.name);
        return new Promise<CartItem[]>( (resolve, reject) => {
            this.cart_client.getCart(get, metadata,(err: ServiceError, response: Cart) => {
                if(err)reject(err);
                else{
                    const items = response.getItemsList().map( x => ({user: user.name, item: x.getProductId(), quantity: x.getQuantity() } as CartItem) );
                    resolve(items);
                }
            });
        });
    }

}


export default Api;