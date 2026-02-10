# Floating Images Web Component

A flexible Web Component that overlays multiple images with a floating depth effect. Each image can be individually configured with its own animation properties. No limit on the number of images!

## Install

```bash
npm install github:ecotoolorg/floating-images-webcomponent
```

## Usage

Pass configuration as a JSON array via the `images` attribute:

```html
<floating-images
  images='[
  {
    "src": "image1.png",
    "direction": "xy",
    "strength": 16,
    "z": 0,
    "duration": 6,
    "delay": 0
  },
  {
    "src": "image2.png",
    "direction": "y",
    "strength": 12,
    "z": 15,
    "duration": 7.5,
    "delay": -1
  }
]'
></floating-images>
```

## Configuration Options

Each image supports the following configuration options:

| Option      | Type   | Default           | Description                              |
| ----------- | ------ | ----------------- | ---------------------------------------- |
| `src`       | string | -                 | Image source URL (required)              |
| `direction` | string | `"y"`             | Float direction: `"x"`, `"y"`, or `"xy"` |
| `strength`  | number | `12`              | Float distance in pixels                 |
| `z`         | number | `index * 15`      | Z-axis depth for 3D effect               |
| `duration`  | number | `6 + index * 1.5` | Animation duration in seconds            |
| `delay`     | number | `-index`          | Animation delay in seconds               |

**Direction options:**

- `"x"` - Float horizontally
- `"y"` - Float vertically (default)
- `"xy"` - Float diagonally

## Styling

The component uses Shadow DOM. You can style the host element:

```css
floating-images {
  width: 500px;
  height: 500px;
  display: block;
}
```

## Features

- ✅ Unlimited number of images
- ✅ Individual configuration per image
- ✅ Three flexible usage methods
- ✅ Smooth CSS animations with 3D depth effect
- ✅ Lightweight with no dependencies
- ✅ SSR-safe (only registers in browser environment)
