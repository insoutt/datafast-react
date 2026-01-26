
export interface CheckoutData {
  customer: Customer;
  cart:     Cart;
}

export interface Cart {
  items: Item[];
}

export interface Item {
  name:        string;
  description: string;
  val_base0:   number;
  val_baseimp: number;
  val_iva:     number;
  quantity:    number;
}

export interface Customer {
  givenName:           string;
  surname:             string;
  email:               string;
  phone:               string;
  identificationDocId: string;
}
