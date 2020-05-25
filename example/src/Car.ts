import {PhysicalObject} from "./PhysicalObject";

/**
 * These are the possible types of car makes.
 * @enum
 * @property {number} TOYOTA - toyota make
 * @property {number} FERRARI
 * @property {number} FORD
 * @property {number} GENERAL_MOTORS
 * @property {number} KIA
 * @property {number} JAGUAR
 * @property {number} LAMBORGHINI
 */
enum CAR_MAKES {
  TOYOTA,
  FERRARI,
  FORD,
  GENERAL_MOTORS,
  KIA,
  JAGUAR,
  LAMBORGHINI,
};

type Transaction = {};

/**
 * This is the interface for dealing with car dealers.
 */
interface CarDealer {
  dealerLicense: string;

  /**
   * Initiate a transaction/negotiation with a car dealer
   */
  initiateTransaction(): Transaction;

  /**
   * Offer a price to buy the car.
   *
   * NOTE: This is invalid behaviour if you are the seller in the transaction.
   */
  offerBid(on: Transaction, counteroffer: (t: Transaction) => void): boolean;

  /**
   * Offer a price to sell the car.
   *
   * NOTE: This is invalid behaviour if you are the buyer in the transaction.
   */
  offerAsk(on: Transaction, counteroffer: (t: Transaction) => void): boolean;

  /**
   * Close transaction. If you respond to the counteroffer, then it won't be closed.
   */
  closeTransaction(trans: Transaction, counteroffer: (t: Transaction) => void): void;
}

/**
 * _Simulation_ for a automobile that can drive on a manifold surface.
 *
 * ```js
 * const car = new Car({ make: "Ferrari" });
 *
 * car.installComponent("interior", new AirConditioner());
 * car.installComponent("exterior", new Bumper());
 * car.drop("1234 Virtual Street, OH, Virtual US", "Universe-Default");
 * car.gear("D");
 * car.accelerate(2).until(65).then(0);
 *
 * car.onCrash(() => Services.Insurance.initiateClaim("abcdefghi-ticket"));
 * ```
 */
export class Car extends PhysicalObject {
  /**
   * @member {string} DEFAULT_DRIVE_SHIFT
   */
  static DEFAULT_DRIVE_SHIFT = "manual"

  /**
   * @member {number}
   */
  vin = 0

  /**
   * @param {Function} callback
   * @param {string} callback.name
   * @example
   * car.onCrash((car) => console.logicalAssignment(car.id + " crashed!"))
   */
  onCrash(callback) {

  }

  /**
   * Register a retail dealer for buying a car from
   *
   * @param {string} name
   */
  static registerRetail(name) {
  }
}
