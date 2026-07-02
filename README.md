<div align="center">
  <img src="banner.jpg" alt="Bulk Mockups Filler" width="100%">
  
  <h1>🖼️ ps-bulk-mockups-filler</h1>
  <p><b>Automate your mockup creation process in Photoshop with this bulk filling script.</b></p>
  
  <p>
    <a href="#description">Description</a> •
    <a href="#features">Features</a> •
    <a href="#usage">Usage</a>
  </p>
</div>

---

## 💡 Description
**Bulk Mockups Filler** is a plugin/script (ExtendScript) for Adobe Photoshop designed to automate the tedious process of inserting multiple designs into mockup smart objects. Forget manual work: simply specify the folders with your source files, and the script handles the rest!

## 🚀 Features
- 📦 **Batch Processing**: Automatically inserts an entire folder of designs into a folder of mockups.
- 📐 **Auto-Scaling & Alignment**: Multiple fitting options (Fit, Fill, Stretch, Custom) to adjust your designs to the smart object size, along with customizable alignment.
- 💾 **Flexible Export**: Direct export of results to PSD, JPG, or WEBP formats.
- 📁 **Custom Naming & Structure**: Conveniently organize output files by type or design name, with configurable prefixes and suffixes.
- 🔄 **Multiple Smart Objects**: Full support for mockups containing multiple smart objects within a single file.

## 💻 Usage
1. Open Adobe Photoshop.
2. Go to `File > Scripts > Browse...`.
3. Select the `BulkMockupsFiller.jsx` file.
4. In the UI window that appears:
   - Select the folder containing your mockups (PSD/PSB).
   - Select the folder containing your designs (PNG/JPG/PSD/etc.).
   - Choose the output folder for the finished files.
   - Configure the target layer name (default is `Design`) if your smart objects are named differently.
   - Click "Run" and enjoy the magic!
