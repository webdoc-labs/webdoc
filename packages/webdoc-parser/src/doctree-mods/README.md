# Doc-tree Mods

After all files are parsed into a doc-tree, post-transform modifications are applied. These modifications can
be done by plugins. The following two modifications are done built-in:

* `member` scope resolution for assignments: A `this.member = 'value';` should be the child of the "class" or
"object" being referred to as "this", not the enclosing method in which the assignment is made.

```js
/**
 * @class
 */
class Example
{
    /**
     * @constructor
     */
    constructor()
    {
        /**
         */
        this.prop = 'value';// this will be moved to children of Example ClassDoc
    }
}
```

* `memberof` resolution: Some entities can be moved to a different doc scope:

```js
/**
 * @namespace PIXI
 */

/**
 * @memberof PIXI.filters <-- this depends on another memberof being resolved.
 */
class AnotherExample {}

/**
 * @memberof PIXI
 * @namespace filters
 */

/**
 * @memberof PIXI
 */
class Renderer/* will be moved to PIXI namespace */ {}
```