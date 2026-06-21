# Bulk Mockups Filler

An ExtendScript-based Photoshop plugin designed to automate the process of inserting multiple designs into smart object mockups.

## Features
- **Batch Processing**: Insert multiple designs into multiple mockups automatically.
- **Auto-Resizing & Alignment**: Fit, Fill, Stretch, or Custom resize designs to fit your smart objects perfectly, with alignment options.
- **Flexible Exporting**: Export results directly to PSD, JPG, or WEBP.
- **Custom Naming & Structure**: Organize outputs by file type or design name, and easily configure prefixes and suffixes.
- **Multiple Smart Objects**: Apply designs to single or multiple smart objects within the same mockup.

## How to Use
1. Open Adobe Photoshop.
2. Go to `File > Scripts > Browse...`
3. Select the `BulkMockupsFiller.jsx` file.
4. In the UI:
   - Provide the folder containing your Mockups (PSD/PSB).
   - Provide the folder containing your Designs (PNG/JPG/PSD/etc).
   - Choose an Output folder.
   - Adjust the target layer name (default is `Design`) if your smart objects are named differently.
   - Click **Run**.

## Demonstration
Check the `Demo/` folder in this repository:
- `Demo/Mockups/` contains a sample mockup file.
- `Demo/Designs/` contains sample design images.
- Use the script with these folders to test the plugin.

## Requirements
- Adobe Photoshop CS6 or newer (CC recommended).
- Designed for standard ExtendScript environments.
