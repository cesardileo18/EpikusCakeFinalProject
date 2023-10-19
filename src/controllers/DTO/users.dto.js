export default class UsersDTO {
  constructor(users) {
    this._id = users._id;
    this.firstName = users.firstName;
    this.lastName = users.lastName;
    this.age = users.age;
    this.email = users.email;
    this.password = users.password;
    this.role = users.role;
    this.premium = users.premium;
    this.cartID = users.cartID;
    this.purchase_made = users.purchase_made;
    this.last_connection = users.last_connection;
    this.documents = users.documents;
  }
}
