import {PhysicalObject} from "./PhysicalObject";

/**
 * These are the possible types of car makes.
 * @enum {number}
 * @property {number} TOYOTA=a - toyota make
 * @property {number} FERRARI=2
 * @property {number} FORD=3
 * @property {number} GENERAL_MOTORS=4
 * @property {number} KIA=5
 * @property {number} JAGUAR=6
 * @property {number} LAMBORGHINI=7
 *
 * @see CarDealer
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

/**
 * This is the interface for dealing with car dealers.
 */
interface CarDealer {
  dealerLicense: string;

  /**
   * Initiate a transaction/negotiation with a car dealer
   *
   * @param {object} [x] - info
   */
  initiateTransaction(x: { subopt: Transaction[0], anotheropt: Vector<3> }): typeof Transaction;

  /**
   * Offer a price to buy the car.
   *
   * NOTE: This is invalid behaviour if you are the seller in the transaction.
   *
   * @param on
   * @param {Car | Vector} [counteroffer] -
   */
  offerBid(on?: { t: Transaction,[id: string]: Transaction[]}, ...counteroffer?: (t: Transaction) => void): boolean;

  /**
   * Offer a price to sell the car.
   *
   * NOTE: This is invalid behaviour if you are the buyer in the transaction.
   *
   * @return type inference is working
   */
  offerAsk(on: Transaction, counteroffer?: (t: Car) => void, test: { [testProperty in keyof CAR_MAKES]: number }): boolean;

  /**
   * Close transaction. If you respond to the counteroffer, then it won't be closed.
   */
  closeTransaction(trans: Transaction, counteroffer: (...t: Transaction) => void): trans is Transaction;
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
   */
  constructor(public model: string = "TEST") {
    super();
  }

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

/** @namespace Ts */

/**
 * @memberof Ts
 */
class Transaction {

}

/**
 * Banana
 *
 * @memberof Ts
 */
type Banana = {
  /** Peels in banana */
  peels: number;

  /** Color of banana */
  color: 'yellow' | 'green';

  /**
   * Analytics around how many people have interacted with this banana
   */
  usage: {
    /** How many people touched this banana */
    touchedBy: number

    /** How many people have eaten this banana */
    eatenBy: number
  }

  /**
   * Evaluate if banana is ripe for eating
   */
  ripe(): boolean

  /**
   * Check if banana has rotten
   */
  rotten(): boolean
}
