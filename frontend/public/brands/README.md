# Brand logos for the homepage brand tabs

The easiest way to set a logo is in the admin panel: open any product, type the
brand name, and use **Brand logo → Upload**. An uploaded logo always takes
priority over the files and built-in logos below; **Use default** removes it.

Nike, Adidas, Puma, New Balance, Reebok, Jordan and Fila logos are built in
(`components/products/BrandLogo.tsx`).

For any other brand, add its official logo here, named after the brand in
lowercase with spaces removed, as `.svg` (preferred) or `.png`:

- `vans.svg` / `vans.png`
- `lv.svg` / `lv.png` (Louis Vuitton, also used for "L.V.")

Use a square-ish logo with a transparent background. Until a file exists, the
tab shows a shoe icon next to the brand name. Redeploy after adding files.
