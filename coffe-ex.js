const readline = require('readline-sync');
const { DynamoDBClient, GetItemCommand, ScanCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
    region: "us-east-2"
});

async function getAllOrders(name) {
const command = new ScanCommand({ TableName: "CustomerOrder" });
const data = await client.send(command);
return data.Items;
}

async function viewTotalSpent(name) {
const orders = await getAllOrders(); // get all orders
const ordersByCustomers = orders.filter(order => order.customerName.S === name); // filter by name 
let total = 0;

for (const order of ordersByCustomers){ // loop thru the orders
    const coffee = order.coffeeType.S; //s=string
    const quantity = order.quantity.N; //n-number
    const price = order.price.N;
    const subtotal = quantity * price;
    total += subtotal;

    console.log(`${order.orderID.S}: ${quantity} ${coffee}.s Each is ${price} * ${quantity} = ${total}`);
}
console.log(`Total that ${name.toUpperCase()} has spent: ${total.toFixed(2)}.`);
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
    console.log(`No orders found for ${name}`);
}
}
/* 
go thru the array of orders and print out or save ina varibale the coffee type
*/
 
async function viewOrderDetails(orderID) {
    //print all attributes of a certian order. 
    console.log("order Details")

    const params = {
        TableName: 'CustomerOrder',
        Key: {
            orderID: { 
                S: orderID }
        }
    }

const command = new GetItemCommand(params);
const response = await client.send(command);
const order = response.Item;

if (!order) {
    console.log('Order not found');
    return;

}
 console.log('Order Details:');
     for (const key in order) {
        const value = order[key];
       console.log(`${key}: ${object.values(value)[0]}`);

}

};

async function addNewOrder(){
const customerName = readline.question("Enter your name: ");
const coffeeType = readline.question("Enter the coffee type:");
const quantity = readline.questionInt("How many coffees do you want? "); //int is for number strings 
const price = readline.questionFloat("Enter the price: "); //float is for decimal numbers
const orderDate = new Date().toISOString().split('T')[0];  //iso string format is for the date. 
const orderID = `order_${Math.floor(Math.random() * 10000)}`;

const params ={
    TableName: "CustomerOrder",
    Item: {
        orderID: { S: orderID },
        customerName: { S: customerName },
        coffeeType: { S: coffeeType },
        quantity: { N: quantity.toString() },
        price: { N: price.toString() },
        orderDate: { S: orderDate }
    }
};

try {
    const command = new PutItemCommand(params);
    await client.send(command);
    console.log(`Order ${orderID} for ${customerName} placed successfully, Thank You! Come again!`);
} catch (error) {
    console.error(" SORRY, FAILED TO ADD ORDER! ERROR: " ,error);
   // console.log("Order not placed. Please try again");

}
};

async function listAllOrders(){
    const orders = await getAllOrders();
    if (!orders) {
        console.log("No orders found"); 
        return;
    }

    console.log("all Orders: ");
    for (const order of orders) {
        const id = order.orderID.S;
        const name = order.customerName.S;
        console.log(`${id}: ${name}`);

    }
};

async function updateOrder(orderID){

    const params = {
        TableName: "CustomerOrder",
        Key: {
            orderID: { S: orderID }
        }
    };
    try{
        const command = new GetItemCommand(params);
        const response = await client.send(command);

        if (!response.Item){
            console.log("Order not found");
            return;
        } 
        const currentCoffee = response.Item.coffeeType.S;
        const currentQty = response.Item.quantity.N; //N is for number
        const currentPrice = response.Item.price.N; 

        const newCoffee = readline.question(`Enter the new coffee type [${currentCoffee}]: `) || currentCoffee; 
        const newQty = readline.question(`Enter the new quantity [${currentQty}]: `) || currentQty; 
        const newPrice = readline.question(`Enter the new price [${currentPrice}]: `) || currentPrice;
      // || equals or
        const updateParams = {
            TableName: "CustomerOrder",
            Key: {
                orderID: { S: orderID }
            },
            UpdateExpression: "SET coffeeType = :ct, quantity = :q, price = :p",
            ExpressionAttributeValues: {
                ":ct": { S: newCoffee },
                ":q": { N: newQty.toString() },
                ":p": { N: newPrice.toString() }
            },
                 ReturnValues: "UPDATED_NEW"
        };

        const updateCommand = new UpdateItemCommand(updateParams); 
        const result =  await client.send(updateCommand);
        console.log("Order updated successfully:", result.Attributes);
    
    } catch (error) {
        console.error(" FAILED TO UPDATE ORDER, TRY AGAIN!", error);
    }
};


async function deleteOrder(orderID){
    const params = {
        TableName: "CustomerOrder",
        Key: {
            orderID: { S: orderID }
        }
    };

    try {
        const command = new DeleteItemCommand(params);
        await client.send(command);
        console.log(`Order ${orderID} has been deleted successfully`);
    } catch (error) {
        console.error("FAILED TO DELETE ORDER, TRY AGAIN!", error);
    }

};

async function main() {
    console.log("welcome to coffechain order lookup")
    console.log("1. view total spent by a customer");
    console.log("2. view coffe orders by a customer");
    console.log("3. get full order details");
    console.log("4. Add a new order");
    console.log("5. list all orders");
    console.log("6. Update an order" );
    console.log("7. Delete an order");

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
              const orderID = readline.question("Enter the order id: ");
              await viewOrderDetails(orderID);
              break;
       }
         case "4" : {
              await addNewOrder();
              break;
         }
            case "5" : {
                await listAllOrders();
                break;
            }
            case "6" : {
                const orderID = readline.question("Enter the order id: ");
            await updateOrder(orderID);
            break;
            }
            case "7" : {
                const orderID = readline.question("Enter the order id: ");
                await deleteOrder(orderID);
                break;
            }

         default: 
         console.log("Invalid option");
                    
    }
}

main();
