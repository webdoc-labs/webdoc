# Car

A car is an automobile generally used to transport people on roads. This example package contains
an API to simulate cars via the {@link Car} class.

## How to get a Car instance

```js
import {Car, FordEngine, FordTransmission} from "@webdoc/example";

// Create a car built by Ford
const car = new Car({ make: "Ford" });

// Customize car infrastructure with ford components
car.installComponent("slot-engine", new FordEngine({ pistons: 8 }));
car.installComponent("slot-transmission", new FordTransmission({ drive: 4 }));

// Place car on road (on Earth)
car.drop("1234 Virtual St, VA, VUSA", { planet: "Earth" });

// Set gear to "drive"
car.gear("D");

// Accelerate 2 m/s every second until we reach 100 m/s and then stop accelerating
car.accelerate(2).until(100).then(0);

// If you have insurance, add a callback to ensure you are insured
car.onCrash(() => Services.Insurance.initiateClaim("<your-insurance-token>"));
```

## Using financial services

If you don't have enough cash in your bank account immediately, you can use financial services to get a credit
to buy a car. You will have to involve a creditor and use an explicit transaction:

```js
const transaction = Services.Bank.requestCredit({
  type: "auto-loan",
  details: {
    make: "Ford",
    model: "Chevy"
  }
});

transaction.items.register(new CarDetails({ make: "Ford", model: "Chevy" }));

if (transaction.credit.isApproved()) {
  const car = transaction.execute(new Car({ make: "Ford", model: "Chevy" }));
} else {
  console.error("You need to generate more cashflow to buy a car at this time.");
}
```

## Getting auto-insurance

To buy auto-insurance, you must have a car:

```js
const insurance = Services.Insurance.buy({
  type: "auto-insurance",
  items: [car]
});

insurance.onPremiumPaymentStatusChange(() => console.warn("You might want to pay your premium!"));

if (insurance.isApproved()) {
  console.log("Congrats!");
} else {
  console.error("Low on money, buddy!");
}
```
