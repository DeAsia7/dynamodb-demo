const readline = require('readline-sync');
const { DynamoDBClient, GetItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
    region: "us-east-2"
});

async function getAllOrders(name) {
const command = new ScanCommand({ TableName: "CustomerOrders" });
const data = await client.send(command);
return data.Items;
}

async function viewTotalSpent(name) {
const orders = await getAllOrders(); // get all orders
const ordersByCustomers = orders.filter(order => order.customerName.S === name); // filter by name 
let total = 0;

for (const order of ordersByCustomers){ // loop thru the orders
    const coffee = order.coffee.S; //s=string
    const quantity = order.quantity.N; //n-number
    const price = order.price.N;
    const total = quantity * price;
    total += total;

    console.log('${order.orderId.S}: ${quantity} ${coffee}.s Each is ${price} * ${quantity} = ${total}');
}
console.log('Total that ${name.toUpperCase()} has spent: ${total.toFixed(2)}.');
}
/* 
name: "mallory"
order # = coffee type, price, quantity 
*/

async function viewCoffeeType(name) {
const orders = await getAllOrders();
const ordersByCustomers = orders.filter(order => order.customerName.S === name); // filter by name 

const coffeeList = [];
for (const order of ordersByCustomers){
    const coffee = order.coffeeType.S;
    if (!coffeeList.includes(coffee)){
        coffeeList.push(coffee);
    }
}

if (coffeeList.length > 0) {
    console.log (`${name}: ${coffeeList.join(',')}.`);
} else {
    console.log('No orders found for ${name}');
}
}
/* 
go thru the array of orders and print out or save ina varibale the coffee type
*/
 
async function viewOrderDetails(orderId) {
    //print all attributes of a certian order. 
}


async function main() {
    console.log("welcome to coffechain order lookup")
    console.log("1. view total spent by a customer");
    console.log("2. view coffe orders by a customer");
    console.log("3. get full order details");

    const option = readline.question("choose an option: ");

    switch(option){
        case "1" : {
            const name = readline.question("Enter the customer name: ");
            await viewTotalSpent(name);
            break;
        }
         case "2" : { 
            const name = readline.question("Enter the customer name: ");
            await viewCoffeeType(name);
             break;
         }
       case "3" : {
              const orderId = readline.question("Enter the order id: ");
              await viewOrderDetails(orderId);
              break;
       }
         default: 
         console.log("Invalid option");
                    
    }
}

main();