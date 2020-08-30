# scss-utils

> Copied from [scss-utils](https://github.com/Zekfad/scss-utils).
> See [#23](https://github.com/webdoc-js/webdoc/issues/23) for more info about that.

Here's set of userful mixins and functions I use in my projects. Feel free to contribute and use.

## Mixins

### all

`_all.scss` includes all mixins and functions available in this repository.

### materialDesignColors

#### `md-color`

> Warning: This is a `function`.

Get material design color

Params:
* color-name - quoted, lower-case, dasherized color name (e.g. 'pink', 'amber')
* quoted, lowercase color variant (e.g. '200', 'a100')

```scss
// Example usage:
.my-class {
    color: md-color('pink', '500');
}
```

### math

This is a special file which includes multiple `functions` and some `constants` related to math.

#### `$pi`

> 3.14159265

#### `$e`

> 2.71828183

#### `$ln10`

> 2.30258509

#### `fact($value)`

Factorial of `$value`.

#### `summation($iteratee, $input, $initial: 0, $limit: 100)`

Calls function `$iteratee` with first argument as `$input` and second as number of iteration and then sum all results.

This is used for series.

#### `exp($value)`

Calculate exponent function of `$value`.

#### `ln($value)`

Calculate natural logarithm of `$value`.

#### `log($base, $value)`

Calculate the base `$base` logarithm of `$value`.

#### `pow($base, $exponent)`

Calculate `$base` in power of `$exponent`.

#### `sqrt($value)`;

Calculate square root of `$value`.

#### `to-unitless-rad($angle)`

Convert any angle to radians without unit. Supports: 'rad', 'deg', 'grad', 'turn'.

This is used for trigonometric functions.

#### `convert-angle($angle, $unit-name: 'rad')`

Convert units of `$angle`. Supports: 'rad', 'deg', 'grad', 'turn'.

#### `sin($angle)`

Sine of `$angle`.

#### `cos($angle)`

Cosine of `$angle`.

#### `tan($angle)`

Tangent of `$angle`.

#### `tg($angle)`

Alias for `tan($angle)`.

#### `arcsin($z)`

Arcsine of `$z`.

#### `arccos($z)`

Arccosine of `$z`.

#### `arctan($z)`

Arctangent of `$z`.

#### `asin($z)`

Alias for `arcsin($z)`.

#### `acos($z)`

Alias for `arccos($z)`.

#### `atan($z)`

Alias for `arctan($z)`.

#### `atan2($x, $y)`

[`atan2`](https://en.wikipedia.org/wiki/Atan2) function.

### animation

#### `keyframes`

Used to wrap keyframes block into vendor prefixed versions:

```scss
@include keyframes($name) {
    // content
}
```

#### `animation`
Used to wrap animation directives into vendor prefixed versions:
```scss
@include animation($name,
                   $duration,
                   $timing-function: ease-in-out,
                   $delay: 0,
                   $direction: normal,
                   $iteration-count: infinite,
                   $fill-mode: none,
                   $play-state: running);
```

### calc

#### `calc`

Used to wrap calc directive into vendor prefixed versions:

```scss
// Example usage:
.my-class {
    @include calc(width, 100% - 10px);
}
```

### center

#### `center`

Center object using flexbox:

```scss
@include center($align-items-to-center: false);
```

#### `center-margin`

Center object using margin:

```scss
@include center-margin;
```

### flex

#### `flex`

Create flexbox:

```scss
@include flex($display: flex,
              $flex-direction: row,
              $flex-wrap: nowrap,
              $justify-content: flex-start,
              $align-items: stretch,
              $align-content: stretch);
```

### link

#### `link`

Style `a` element **colors** depending on their mode:

```scss
@include link($normal: null,
              $hover: null,
              $active: null,
              $focus: null,
              $visited: null,
              $text-decoration: null);
```

### makeLinesGradient

#### `makeLinesGradient`

Create gradient with two colored lines:

```scss
@include makeLinesGradient($angle: 135deg,
                           $base-color: #ffffff00,
                           $secondary-color: #ffffff00);
```

### normalize

#### `normalize`

Reset margin and padding. Set `$list-fix` to `true` if you need to remove list bullets:
```scss
@include normalize($list-fix: false);
```

### threeSize

Create hard size declaration with same `min-` `max-` and pure directive.

#### `threeHeight`

Set height:
```scss
@include threeHeight($height); 
```

#### `threeWidth`

Set width:
```scss
@include threeWidth($width);
```
