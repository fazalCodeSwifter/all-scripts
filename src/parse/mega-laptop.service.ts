// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/require-await */
// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
// import { Injectable } from '@nestjs/common';
// import * as Papa from 'papaparse';
// import * as fs from 'fs';
// import * as path from 'path';

// interface ParsedProduct {
//   brand: string;
//   main_title: string;
//   variants: ProductVariant[];
// }

// interface ProductVariant {
//   product_title: string;
//   slug: string;
//   description: string;
//   attributes: Record<string, any>;
//   image: string;
//   price: number;
//   discount_off: number;
// }

// @Injectable()
// export class MegaLaptopParserService {
//   /**
//    * CSV file ko parse karke structured products array return karta hai
//    */
//   async parseCsvToProducts(filePath: string): Promise<ParsedProduct[]> {
//     const csvData = fs.readFileSync(filePath, 'utf-8');

//     return new Promise((resolve, reject) => {
//       Papa.parse(csvData, {
//         header: true,
//         skipEmptyLines: true,
//         complete: (results) => {
//           try {
//             const products = this.processRows(results.data);
//             resolve(products);
//           } catch (error) {
//             reject(error);
//           }
//         },
//         error: (error) => {
//           reject(error);
//         },
//       });
//     });
//   }

//   /**
//    * Rows ko process karke products structure banata hai
//    */
//   private processRows(rows: any[]): ParsedProduct[] {
//     const productsMap = new Map<string, ParsedProduct>();

//     rows.forEach((row) => {
//       // Title se Brand aur Main Title extract karo
//       const fullTitle = row['title']?.trim();
//       if (!fullTitle) return;

//       const { brand, mainTitle } = this.extractBrandAndMainTitle(fullTitle);
//       const productKey = `${brand}___${mainTitle}`;

//       // Agar product pehle se exist nahi karta to create karo
//       if (!productsMap.has(productKey)) {
//         productsMap.set(productKey, {
//           brand: brand,
//           main_title: mainTitle,
//           variants: [],
//         });
//       }

//       // Variant create karo
//       const extraxtTitle = this.parseProductTitle(
//         [brand],
//         [mainTitle],
//         fullTitle,
//       );
//       const variant = this.createVariant(row, extraxtTitle.variantTitle);
//       productsMap.get(productKey)!.variants.push(variant);
//     });

//     return Array.from(productsMap.values());
//   }

//   /**
//    * Title se Brand aur Main Title extract karta hai
//    * Example: "Apple MacBook Air 13 MW133..." -> Brand: "Apple", Main Title: "MacBook Air 13"
//    */
//   private extractBrandAndMainTitle(fullTitle: string): {
//     brand: string;
//     mainTitle: string;
//   } {
//     const parts = fullTitle.split(' ');

//     // Pehla word brand hai (Apple, Dell, HP, etc.)
//     const brand = parts[0] || 'Unknown';

//     // Next 2-3 words main title hain
//     // MacBook Air, MacBook Pro, Latitude 5420, etc.
//     let mainTitle = '';

//     if (fullTitle.includes('MacBook')) {
//       // Apple MacBook Pro/Air ke liye
//       const macbookMatch = fullTitle.match(/MacBook\s+(Pro|Air)\s+(\d+)/i);
//       if (macbookMatch) {
//         mainTitle = `MacBook ${macbookMatch[1]} ${macbookMatch[2]}`;
//       } else {
//         mainTitle = parts.slice(1, 3).join(' ');
//       }
//     } else {
//       // Other brands ke liye general approach
//       mainTitle = parts.slice(1, 3).join(' ');
//     }

//     return { brand, mainTitle: mainTitle || 'Unknown Model' };
//   }

//   /**
//    * Single row se variant object banata hai
//    */
//   private createVariant(row: any, fullTitle: string): ProductVariant {
//     // Description empty hai to full title use karo
//     const description = row['description'] || fullTitle;

//     // Price extract karo
//     const priceMatch = row['price']?.match(/Rs\.\s*([\d,]+)/);
//     const price = priceMatch ? priceMatch[1] : '0';

//     // Discount calculate karo
//     const discountMatch = row['price']?.match(/-(\d+)%/);
//     const discountOff = discountMatch ? discountMatch[1] : '0';

//     // Attributes dynamically collect karo
//     const attributes: Record<string, any> = {};

//     // Common attributes mapping
//     const attributeMapping = {
//       'details/installed_ram': 'ram',
//       'details/storage_capacity': 'storage',
//       'details/colors': 'colors',
//       'details/processor_model': 'model',
//       'details/processor': 'processor',
//       'details/no_of_cores': 'cpu',
//       'details/screen_size': 'screen',
//       'details/touchscreen': 'touch_screen',
//       'details/operating_system': 'operating_system',
//       'details/processor_speed': 'processor_speed',
//       'details/chipset': 'chipset',
//       'details/type': 'type',
//       'details/screen_resolution': 'screen_resolution',
//       'details/graphics_processor': 'graphics_processor',
//       'details/weight': 'weight',
//       'details/dimensions_wxhxd': 'dimensions',
//       'details/battery_type': 'battery_type',
//       'details/battery_life': 'battery_life',
//       'details/backlit_keyboard': 'backlit_keyboard',
//       'details/fingerprint_feader': 'fingerprint_reader',
//       'details/bluetooth': 'bluetooth',
//       'details/wifi_wireless_fidelity': 'wifi',
//       'details/usb_type-c': 'usb_type_c',
//       'details/hdmi': 'hdmi',
//       'details/camera': 'camera',
//       'details/warranty': 'warranty',
//     };

//     // Attributes extract karo
//     Object.keys(attributeMapping).forEach((csvKey) => {
//       const value = row[csvKey]?.toString().trim();
//       if (value && value !== '' && value !== 'undefined') {
//         attributes[attributeMapping[csvKey]] = value;
//       }
//     });

//     return {
//       product_title: fullTitle,
//       slug: this.slugify(fullTitle),
//       description: description,
//       attributes: attributes,
//       image: row['images/0']?.trim() || '',
//       price: this.convertNumber(price),
//       discount_off: this.convertNumber(discountOff),
//     };
//   }

//   /**
//    * Output ko desired format mein convert karta hai
//    */
//   convertToDesiredFormat(products: ParsedProduct[]): any[] {
//     const output: any[] = [];

//     products.forEach((product) => {
//       product.variants.forEach((variant) => {
//         output.push({
//           Brand: product.brand,
//           'Main Title': product.main_title,
//           'Variants/Product title': variant.product_title,
//           'Variants/Description': variant.description,
//           'variants/attributes/ram': variant.attributes.ram || '',
//           'variants/attributes/storage': variant.attributes.storage || '',
//           'variants/attributes/colors': variant.attributes.colors || '',
//           'variants/image': variant.image,
//           'variants/price': variant.price,
//           'variants/discount off': variant.discount_off,
//           'variants/attributes/model': variant.attributes.model || '',
//           'variants/attributes/processor': variant.attributes.processor || '',
//           'variants/attributes/cpu': variant.attributes.cpu || '',
//           'variants/attributes/screen': variant.attributes.screen || '',
//           'variants/attributes/touch screen':
//             variant.attributes.touch_screen || '',
//           'variants/attributes/operating system':
//             variant.attributes.operating_system || '',
//           'variants/attributes/processor speed':
//             variant.attributes.processor_speed || '',
//           'variants/attributes/chipset': variant.attributes.chipset || '',
//           'variants/attributes/type': variant.attributes.type || '',
//           'variants/attributes/screen resolution':
//             variant.attributes.screen_resolution || '',
//           'variants/attributes/graphics processor':
//             variant.attributes.graphics_processor || '',
//           'variants/attributes/weight': variant.attributes.weight || '',
//           'variants/attributes/dimensions': variant.attributes.dimensions || '',
//           'variants/attributes/battery type':
//             variant.attributes.battery_type || '',
//           'variants/attributes/battery life':
//             variant.attributes.battery_life || '',
//           'variants/attributes/backlit keyboard':
//             variant.attributes.backlit_keyboard || '',
//           'variants/attributes/fingerprint reader':
//             variant.attributes.fingerprint_reader || '',
//           'variants/attributes/bluetooth': variant.attributes.bluetooth || '',
//           'variants/attributes/wifi': variant.attributes.wifi || '',
//           'variants/attributes/usb type c': variant.attributes.usb_type_c || '',
//           'variants/attributes/hdmi': variant.attributes.hdmi || '',
//           'variants/attributes/camera': variant.attributes.camera || '',
//           'variants/attributes/warranty': variant.attributes.warranty || '',
//         });
//       });
//     });

//     return output;
//   }

//   /**
//    * Products ko CSV format mein save karta hai
//    */
//   async saveToCsvFile(products: any[], outputPath: string): Promise<void> {
//     const dir = path.dirname(outputPath);
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     const csv = Papa.unparse(products);
//     fs.writeFileSync(outputPath, csv, 'utf-8');
//     console.log(`✓ CSV saved to ${outputPath}`);
//   }

//   /**
//    * Products ko JSON file mein save karta hai
//    */
//   async saveToJsonFile(products: any[], outputPath: string): Promise<void> {
//     const dir = path.dirname(outputPath);
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     const jsonData = JSON.stringify(products, null, 2);
//     fs.writeFileSync(outputPath, jsonData, 'utf-8');
//     console.log(`✓ JSON saved to ${outputPath}`);
//   }

//   /**
//    * Statistics generate karta hai
//    */
//   generateStats(products: ParsedProduct[]) {
//     const totalVariants = products.reduce(
//       (sum, p) => sum + p.variants.length,
//       0,
//     );
//     const brandCounts = new Map<string, number>();

//     products.forEach((product) => {
//       const count = brandCounts.get(product.brand) || 0;
//       brandCounts.set(product.brand, count + 1);
//     });

//     return {
//       total_products: products.length,
//       total_variants: totalVariants,
//       brands: Array.from(brandCounts.entries()).map(([brand, count]) => ({
//         brand,
//         product_count: count,
//       })),
//     };
//   }

//   convertNumber(value: string | number | null | undefined): number {
//     if (value === null || value === undefined) return 0;

//     if (typeof value === 'number') return value;

//     return Number(value.replace(/,/g, '')) || 0;
//   }

//   private slugify(text: string) {
//     return text
//       .toLowerCase()
//       .replace(/ /g, '-')
//       .replace(/[^\w-]+/g, '');
//   }

//   private parseProductTitle(
//     brands: string[],
//     mainTitles: string[],
//     fullTitle: string,
//   ) {
//     let brand = '';
//     let mainTitle = '';
//     let variantTitle = fullTitle;

//     // 1️⃣ Detect brand
//     for (const b of brands) {
//       if (variantTitle.toLowerCase().startsWith(b.toLowerCase())) {
//         brand = b;
//         variantTitle = variantTitle.slice(b.length).trim();
//         break;
//       }
//     }

//     // 2️⃣ Detect main title
//     for (const mt of mainTitles) {
//       if (variantTitle.toLowerCase().startsWith(mt.toLowerCase())) {
//         mainTitle = mt;
//         variantTitle = variantTitle.slice(mt.length).trim();
//         break;
//       }
//     }

//     return {
//       variantTitle,
//     };
//   }
// }

// ------------------------------------------------------ MEGA APPLE IPAD SCRIPT  ------------------------------------------------------

// // /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/require-await */
// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
// import { Injectable } from '@nestjs/common';
// import * as Papa from 'papaparse';
// import * as fs from 'fs';
// import * as path from 'path';

// interface ParsedProduct {
//   brand: string;
//   main_title: string;
//   variants: ProductVariant[];
// }

// interface ProductVariant {
//   product_title: string;
//   slug: string;
//   description: string;
//   attributes: Record<string, any>;
//   image: string;
//   price: number;
//   discount_off: number;
// }

// @Injectable()
// export class MegaLaptopParserService {
//   /**
//    * CSV file ko parse karke structured products array return karta hai
//    */
//   async parseCsvToProducts(filePath: string): Promise<ParsedProduct[]> {
//     const csvData = fs.readFileSync(filePath, 'utf-8');

//     return new Promise((resolve, reject) => {
//       Papa.parse(csvData, {
//         header: true,
//         skipEmptyLines: true,
//         complete: (results) => {
//           try {
//             const products = this.processRows(results.data);
//             resolve(products);
//           } catch (error) {
//             reject(error);
//           }
//         },
//         error: (error) => {
//           reject(error);
//         },
//       });
//     });
//   }

//   /**
//    * Rows ko process karke products structure banata hai
//    */
//   private processRows(rows: any[]): ParsedProduct[] {
//     const productsMap = new Map<string, ParsedProduct>();

//     rows.forEach((row) => {
//       // Title se Brand aur Main Title extract karo (lowercase column)
//       const fullTitle = row['title']?.trim();
//       if (!fullTitle) return;

//       const { brand, mainTitle } = this.extractBrandAndMainTitle(fullTitle);
//       const productKey = `${brand}___${mainTitle}`;

//       // Agar product pehle se exist nahi karta to create karo
//       if (!productsMap.has(productKey)) {
//         productsMap.set(productKey, {
//           brand: brand,
//           main_title: mainTitle,
//           variants: [],
//         });
//       }

//       // Variant create karo
//       const extractTitle = this.parseProductTitle(
//         [brand],
//         [mainTitle],
//         fullTitle,
//       );
//       const variant = this.createVariant(row, extractTitle.variantTitle);
//       productsMap.get(productKey)!.variants.push(variant);
//     });

//     return Array.from(productsMap.values());
//   }

//   /**
//    * Title se Brand aur Main Title extract karta hai
//    * iPad specific patterns
//    */
//   private extractBrandAndMainTitle(fullTitle: string): {
//     brand: string;
//     mainTitle: string;
//   } {
//     const parts = fullTitle.split(' ');

//     // Pehla word brand hai (Apple mostly for iPads)
//     const brand = parts[0] || 'Unknown';

//     let mainTitle = '';

//     // iPad Air 13, iPad Pro 11, iPad Mini 7, etc.
//     if (fullTitle.includes('iPad')) {
//       const ipadMatch = fullTitle.match(/iPad\s+(Air|Pro|Mini)?\s*(\d+)?/i);
//       if (ipadMatch) {
//         const type = ipadMatch[1] || ''; // Air, Pro, Mini, or empty
//         const size = ipadMatch[2] || ''; // 11, 13, etc.

//         if (type && size) {
//           mainTitle = `IPad ${type} ${size}`;
//         } else if (type) {
//           mainTitle = `IPad ${type}`;
//         } else if (size) {
//           mainTitle = `IPad ${size}`;
//         } else {
//           mainTitle = 'IPad';
//         }
//       } else {
//         mainTitle = 'IPad';
//       }
//     } else {
//       // Fallback for other brands
//       mainTitle = parts.slice(1, 3).join(' ');
//     }

//     return { brand, mainTitle: mainTitle || 'Unknown Model' };
//   }

//   /**
//    * Single row se variant object banata hai
//    */
//   private createVariant(row: any, fullTitle: string): ProductVariant {
//     // Description (lowercase column)
//     const description = row['description'] || fullTitle;

//     // Price extract karo - handle multiple formats
//     const priceStr = row['price']?.toString() || '0';

//     let finalPrice = '0';
//     let discount = '0';

//     // Handle "Coming Soon" or empty prices
//     if (
//       priceStr === '0' ||
//       priceStr.toLowerCase().includes('coming soon') ||
//       priceStr.toLowerCase().includes('n/a')
//     ) {
//       finalPrice = '0';
//       discount = '0';
//     } else {
//       const priceMatch = priceStr.match(/Rs\.\s*([\d,]+)/g);

//       if (priceMatch && priceMatch.length > 0) {
//         // Last price is the final/discounted price
//         const lastPrice = priceMatch[priceMatch.length - 1];
//         finalPrice = lastPrice.replace(/Rs\.\s*/g, '').replace(/,/g, '');

//         // Calculate discount percentage
//         const discountMatch = priceStr.match(/-(\d+)%/);
//         if (discountMatch) {
//           discount = discountMatch[1];
//         }
//       }
//     }

//     // Attributes dynamically collect karo
//     const attributes: Record<string, any> = {};

//     // Tablet/iPad specific attributes mapping (lowercase column names)
//     const attributeMapping: Record<string, string> = {
//       // Basic specs
//       'details/brand': 'brand_detail',
//       'details/operating_system': 'operating_system',
//       'details/screen_size': 'screen',
//       'details/ram_size': 'ram',
//       'details/internal_storage_space': 'storage',

//       // Display
//       'details/display_technology': 'display_technology',
//       'details/display_features': 'display_features',
//       'details/screen_resolution': 'screen_resolution',
//       'details/pixel_density': 'pixel_density',
//       'details/touch_screen': 'touch_screen',
//       'details/refresh_rate': 'refresh_rate',

//       // Processor
//       'details/type_of_processor': 'processor',
//       'details/processor_core_type': 'processor_core_type',
//       'details/cpu': 'cpu',
//       'details/chipset': 'chipset',
//       'details/graphics_processor_type': 'gpu',

//       // Camera
//       'details/built-in_camera': 'built_in_camera',
//       'details/number_of_cameras': 'number_of_cameras',
//       'details/front_camera_resolution': 'front_camera',
//       'details/main_camera_resolution': 'main_camera',
//       'details/camera_features': 'camera_features',

//       // Connectivity
//       'details/4g': '4g',
//       'details/5g': '5g',
//       'details/bluetooth': 'bluetooth',
//       'details/bluetooth_profile': 'bluetooth_profile',
//       'details/wi-fi': 'wifi',
//       'details/supports_nfc': 'nfc',
//       'details/sim_slot': 'sim_slot',
//       'details/sim_slot_type': 'sim_slot_type',

//       // Ports & Features
//       'details/usb': 'usb',
//       'details/charging_via_usb': 'charging_via_usb',
//       'details/headphone_port': 'headphone_port',
//       'details/stylus_support': 'stylus_support',

//       // Security
//       'details/security': 'security',
//       'details/sensors': 'sensors',

//       // Physical
//       'details/colour': 'colors',
//       'details/dimensions_wxhxd': 'dimensions',
//       'details/weight': 'weight',
//       'details/body': 'body',

//       // Battery
//       'details/battery_capacity': 'battery_capacity',
//       'details/battery_type': 'battery_type',
//       'details/built-in_wireless_charging': 'wireless_charging',
//       'details/support_fast_charging': 'fast_charging',

//       // Other
//       'details/buttons': 'buttons',
//       'details/built-in_speakers': 'speakers',
//       'details/warranty': 'warranty',
//       'details/memory_card_readers': 'memory_card_readers',
//       'details/type_of_memory': 'memory_type',
//       'details/release_year': 'release_year',
//       'details/operating_system_os': 'os_version',
//     };

//     // Attributes extract karo
//     Object.keys(attributeMapping).forEach((csvKey) => {
//       const value = row[csvKey]?.toString().trim();
//       if (value && value !== '' && value !== 'undefined' && value !== 'null') {
//         attributes[attributeMapping[csvKey]] = value;
//       }
//     });

//     return {
//       product_title: fullTitle,
//       slug: this.slugify(fullTitle),
//       description: description,
//       attributes: attributes,
//       image: row['images/0']?.trim() || '',
//       price: this.convertNumber(finalPrice),
//       discount_off: this.convertNumber(discount),
//     };
//   }

//   /**
//    * Output ko desired format mein convert karta hai
//    */
//   convertToDesiredFormat(products: ParsedProduct[]): any[] {
//     const output: any[] = [];

//     products.forEach((product) => {
//       product.variants.forEach((variant) => {
//         output.push({
//           Brand: product.brand,
//           'Main Title': product.main_title,
//           'Variants/Product title': variant.product_title,
//           'Variants/Description': variant.description,

//           // Core specs
//           'variants/attributes/ram': variant.attributes.ram || '',
//           'variants/attributes/storage': variant.attributes.storage || '',
//           'variants/attributes/colors': variant.attributes.colors || '',
//           'variants/image': variant.image,
//           'variants/price': variant.price,
//           'variants/discount off': variant.discount_off,

//           // Display
//           'variants/attributes/screen': variant.attributes.screen || '',
//           'variants/attributes/screen resolution':
//             variant.attributes.screen_resolution || '',
//           'variants/attributes/display technology':
//             variant.attributes.display_technology || '',
//           'variants/attributes/display features':
//             variant.attributes.display_features || '',
//           'variants/attributes/pixel density':
//             variant.attributes.pixel_density || '',
//           'variants/attributes/touch screen':
//             variant.attributes.touch_screen || '',
//           'variants/attributes/refresh rate':
//             variant.attributes.refresh_rate || '',

//           // Processor
//           'variants/attributes/processor': variant.attributes.processor || '',
//           'variants/attributes/processor core type':
//             variant.attributes.processor_core_type || '',
//           'variants/attributes/cpu': variant.attributes.cpu || '',
//           'variants/attributes/chipset': variant.attributes.chipset || '',
//           'variants/attributes/gpu': variant.attributes.gpu || '',

//           // Operating System
//           'variants/attributes/operating system':
//             variant.attributes.operating_system || '',
//           'variants/attributes/os version': variant.attributes.os_version || '',

//           // Camera
//           'variants/attributes/built in camera':
//             variant.attributes.built_in_camera || '',
//           'variants/attributes/number of cameras':
//             variant.attributes.number_of_cameras || '',
//           'variants/attributes/front camera':
//             variant.attributes.front_camera || '',
//           'variants/attributes/main camera':
//             variant.attributes.main_camera || '',
//           'variants/attributes/camera features':
//             variant.attributes.camera_features || '',

//           // Connectivity
//           'variants/attributes/4g': variant.attributes['4g'] || '',
//           'variants/attributes/5g': variant.attributes['5g'] || '',
//           'variants/attributes/bluetooth': variant.attributes.bluetooth || '',
//           'variants/attributes/bluetooth profile':
//             variant.attributes.bluetooth_profile || '',
//           'variants/attributes/wifi': variant.attributes.wifi || '',
//           'variants/attributes/nfc': variant.attributes.nfc || '',
//           'variants/attributes/sim slot': variant.attributes.sim_slot || '',

//           // Ports & Features
//           'variants/attributes/usb': variant.attributes.usb || '',
//           'variants/attributes/charging via usb':
//             variant.attributes.charging_via_usb || '',
//           'variants/attributes/headphone port':
//             variant.attributes.headphone_port || '',
//           'variants/attributes/stylus support':
//             variant.attributes.stylus_support || '',

//           // Security
//           'variants/attributes/security': variant.attributes.security || '',
//           'variants/attributes/sensors': variant.attributes.sensors || '',

//           // Physical
//           'variants/attributes/dimensions': variant.attributes.dimensions || '',
//           'variants/attributes/weight': variant.attributes.weight || '',
//           'variants/attributes/body': variant.attributes.body || '',

//           // Battery
//           'variants/attributes/battery capacity':
//             variant.attributes.battery_capacity || '',
//           'variants/attributes/battery type':
//             variant.attributes.battery_type || '',
//           'variants/attributes/wireless charging':
//             variant.attributes.wireless_charging || '',
//           'variants/attributes/fast charging':
//             variant.attributes.fast_charging || '',

//           // Other
//           'variants/attributes/buttons': variant.attributes.buttons || '',
//           'variants/attributes/speakers': variant.attributes.speakers || '',
//           'variants/attributes/warranty': variant.attributes.warranty || '',
//           'variants/attributes/release year':
//             variant.attributes.release_year || '',
//           'variants/attributes/memory type':
//             variant.attributes.memory_type || '',
//         });
//       });
//     });

//     return output;
//   }

//   /**
//    * Products ko CSV format mein save karta hai
//    */
//   async saveToCsvFile(products: any[], outputPath: string): Promise<void> {
//     const dir = path.dirname(outputPath);
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     const csv = Papa.unparse(products);
//     fs.writeFileSync(outputPath, csv, 'utf-8');
//     console.log(`✓ CSV saved to ${outputPath}`);
//   }

//   /**
//    * Products ko JSON file mein save karta hai
//    */
//   async saveToJsonFile(products: any[], outputPath: string): Promise<void> {
//     const dir = path.dirname(outputPath);
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     const jsonData = JSON.stringify(products, null, 2);
//     fs.writeFileSync(outputPath, jsonData, 'utf-8');
//     console.log(`✓ JSON saved to ${outputPath}`);
//   }

//   /**
//    * Statistics generate karta hai
//    */
//   generateStats(products: ParsedProduct[]) {
//     const totalVariants = products.reduce(
//       (sum, p) => sum + p.variants.length,
//       0,
//     );
//     const brandCounts = new Map<string, number>();

//     products.forEach((product) => {
//       const count = brandCounts.get(product.brand) || 0;
//       brandCounts.set(product.brand, count + 1);
//     });

//     return {
//       total_products: products.length,
//       total_variants: totalVariants,
//       brands: Array.from(brandCounts.entries()).map(([brand, count]) => ({
//         brand,
//         product_count: count,
//       })),
//     };
//   }

//   convertNumber(value: string | number | null | undefined): number {
//     if (value === null || value === undefined) return 0;
//     if (typeof value === 'number') return value;
//     return Number(value.replace(/,/g, '')) || 0;
//   }

//   private slugify(text: string) {
//     return text
//       .toLowerCase()
//       .replace(/ /g, '-')
//       .replace(/[^\w-]+/g, '');
//   }

//   private parseProductTitle(
//     brands: string[],
//     mainTitles: string[],
//     fullTitle: string,
//   ) {
//     let variantTitle = fullTitle;

//     // Remove brand from title
//     for (const b of brands) {
//       if (variantTitle.toLowerCase().startsWith(b.toLowerCase())) {
//         variantTitle = variantTitle.slice(b.length).trim();
//         break;
//       }
//     }

//     // Remove main title from variant title
//     for (const mt of mainTitles) {
//       if (variantTitle.toLowerCase().startsWith(mt.toLowerCase())) {
//         variantTitle = variantTitle.slice(mt.length).trim();
//         break;
//       }
//     }

//     return {
//       variantTitle,
//     };
//   }
// }

// // ----------------------------------------------  MEGA APPLE IPHONE  --------------------------------------------------------------

// // /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/require-await */
// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
// import { Injectable } from '@nestjs/common';
// import * as Papa from 'papaparse';
// import * as fs from 'fs';
// import * as path from 'path';

// interface ParsedProduct {
//   brand: string;
//   main_title: string;
//   variants: ProductVariant[];
// }

// interface ProductVariant {
//   product_title: string;
//   slug: string;
//   description: string;
//   attributes: Record<string, any>;
//   image: string;
//   price: number;
//   discount_off: number;
// }

// @Injectable()
// export class MegaLaptopParserService {
//   /**
//    * CSV file ko parse karke structured products array return karta hai
//    */
//   async parseCsvToProducts(filePath: string): Promise<ParsedProduct[]> {
//     const csvData = fs.readFileSync(filePath, 'utf-8');

//     return new Promise((resolve, reject) => {
//       Papa.parse(csvData, {
//         header: true,
//         skipEmptyLines: true,
//         complete: (results) => {
//           try {
//             const products = this.processRows(results.data);
//             resolve(products);
//           } catch (error) {
//             reject(error);
//           }
//         },
//         error: (error) => {
//           reject(error);
//         },
//       });
//     });
//   }

//   /**
//    * Rows ko process karke products structure banata hai
//    */
//   private processRows(rows: any[]): ParsedProduct[] {
//     const productsMap = new Map<string, ParsedProduct>();

//     rows.forEach((row) => {
//       // Title se Brand aur Main Title extract karo (lowercase column)
//       const fullTitle = row['title']?.trim();
//       if (!fullTitle) return;

//       const { brand, mainTitle } = this.extractBrandAndMainTitle(fullTitle);
//       const productKey = `${brand}___${mainTitle}`;

//       // Agar product pehle se exist nahi karta to create karo
//       if (!productsMap.has(productKey)) {
//         productsMap.set(productKey, {
//           brand: brand,
//           main_title: mainTitle,
//           variants: [],
//         });
//       }

//       // Variant create karo
//       const extractTitle = this.parseProductTitle(
//         [brand],
//         [mainTitle],
//         fullTitle,
//       );
//       const variant = this.createVariant(row, extractTitle.variantTitle);
//       productsMap.get(productKey)!.variants.push(variant);
//     });

//     return Array.from(productsMap.values());
//   }

//   /**
//    * Title se Brand aur Main Title extract karta hai
//    * iPad specific patterns
//    */
//   private extractBrandAndMainTitle(fullTitle: string): {
//     brand: string;
//     mainTitle: string;
//   } {
//     const parts = fullTitle.split(' ');

//     // Pehla word brand hai (Apple mostly for iPads)
//     // const brand = parts[0] || 'Unknown';
//     const brand = /^[A-Za-z]+$/.test(parts[0]) ? parts[0] : 'Unknown';

//     let mainTitle = 'iPhone';

//     // iPad Air 13, iPad Pro 11, iPad Mini 7, etc.
//     // if (fullTitle.includes('iPhone')) {
//     //   const ipadMatch = fullTitle.match(
//     //     // /iPhone\s+(Air|Pro|Pro Max)?\s*(\d+)?/i,
//     //     /iPhone\s+(?:\d+\s+)?(Pro Max|Pro|Air)/i,
//     //   );
//     //   if (ipadMatch) {
//     //     const type = ipadMatch[1] || ''; // Air, Pro, Mini, or empty
//     //     const size = ipadMatch[2] || ''; // 11, 13, etc.

//     //     if (type && size) {
//     //       mainTitle = `IPad ${type} ${size}`;
//     //     } else if (type) {
//     //       mainTitle = `IPad ${type}`;
//     //     } else if (size) {
//     //       mainTitle = `IPad ${size}`;
//     //     } else {
//     //       mainTitle = 'IPad';
//     //     }
//     //   } else {
//     //     mainTitle = 'IPad';
//     //   }
//     // } else {
//     //   // Fallback for other brands
//     //   mainTitle = parts.slice(1, 3).join(' ');
//     // }

//     const iphoneMatch = fullTitle.match(
//       /iPhone\s+(?:(\d+)\s*)?(Pro Max|Pro|Air)?/i,
//     );

//     if (iphoneMatch) {
//       const modelNumber = iphoneMatch[1]; // 17
//       const variant = iphoneMatch[2]; // Pro / Pro Max / Air

//       mainTitle = ['iPhone', modelNumber, variant].filter(Boolean).join(' ');
//     }

//     return { brand, mainTitle };
//   }

//   /**
//    * Single row se variant object banata hai
//    */
//   // private createVariant(row: any, fullTitle: string): ProductVariant {
//   //   // Description (lowercase column)
//   //   const description = row['description'] || fullTitle;

//   //   // Price extract karo - handle multiple formats
//   //   const priceStr = row['price']?.toString() || '0';

//   //   let finalPrice = '0';
//   //   let discount = '0';

//   //   // Handle "Coming Soon" or empty prices
//   //   if (
//   //     priceStr === '0' ||
//   //     priceStr.toLowerCase().includes('coming soon') ||
//   //     priceStr.toLowerCase().includes('n/a')
//   //   ) {
//   //     finalPrice = '0';
//   //     discount = '0';
//   //   } else {
//   //     const priceMatch = priceStr.match(/Rs\.\s*([\d,]+)/g);

//   //     if (priceMatch && priceMatch.length > 0) {
//   //       // Last price is the final/discounted price
//   //       const lastPrice = priceMatch[priceMatch.length - 1];
//   //       finalPrice = lastPrice.replace(/Rs\.\s*/g, '').replace(/,/g, '');

//   //       // Calculate discount percentage
//   //       const discountMatch = priceStr.match(/-(\d+)%/);
//   //       if (discountMatch) {
//   //         discount = discountMatch[1];
//   //       }
//   //     }
//   //   }

//   //   // Attributes dynamically collect karo
//   //   const attributes: Record<string, any> = {};

//   //   // Tablet/iPad specific attributes mapping (lowercase column names)
//   //   // const attributeMapping: Record<string, string> = {
//   //   //   // Basic specs
//   //   //   'details/brand': 'brand_detail',
//   //   //   'details/operating_system': 'operating_system',
//   //   //   'details/screen_size': 'screen',
//   //   //   'details/ram_size': 'ram',
//   //   //   'details/internal_storage_space': 'storage',

//   //   //   // Display
//   //   //   'details/display_technology': 'display_technology',
//   //   //   'details/display_features': 'display_features',
//   //   //   'details/screen_resolution': 'screen_resolution',
//   //   //   'details/pixel_density': 'pixel_density',
//   //   //   'details/touch_screen': 'touch_screen',
//   //   //   'details/refresh_rate': 'refresh_rate',

//   //   //   // Processor
//   //   //   'details/type_of_processor': 'processor',
//   //   //   'details/processor_core_type': 'processor_core_type',
//   //   //   'details/cpu': 'cpu',
//   //   //   'details/chipset': 'chipset',
//   //   //   'details/graphics_processor_type': 'gpu',

//   //   //   // Camera
//   //   //   'details/built-in_camera': 'built_in_camera',
//   //   //   'details/number_of_cameras': 'number_of_cameras',
//   //   //   'details/front_camera_resolution': 'front_camera',
//   //   //   'details/main_camera_resolution': 'main_camera',
//   //   //   'details/camera_features': 'camera_features',

//   //   //   // Connectivity
//   //   //   'details/4g': '4g',
//   //   //   'details/5g': '5g',
//   //   //   'details/bluetooth': 'bluetooth',
//   //   //   'details/bluetooth_profile': 'bluetooth_profile',
//   //   //   'details/wi-fi': 'wifi',
//   //   //   'details/supports_nfc': 'nfc',
//   //   //   'details/sim_slot': 'sim_slot',
//   //   //   'details/sim_slot_type': 'sim_slot_type',

//   //   //   // Ports & Features
//   //   //   'details/usb': 'usb',
//   //   //   'details/charging_via_usb': 'charging_via_usb',
//   //   //   'details/headphone_port': 'headphone_port',
//   //   //   'details/stylus_support': 'stylus_support',

//   //   //   // Security
//   //   //   'details/security': 'security',
//   //   //   'details/sensors': 'sensors',

//   //   //   // Physical
//   //   //   'details/colour': 'colors',
//   //   //   'details/dimensions_wxhxd': 'dimensions',
//   //   //   'details/weight': 'weight',
//   //   //   'details/body': 'body',

//   //   //   // Battery
//   //   //   'details/battery_capacity': 'battery_capacity',
//   //   //   'details/battery_type': 'battery_type',
//   //   //   'details/built-in_wireless_charging': 'wireless_charging',
//   //   //   'details/support_fast_charging': 'fast_charging',

//   //   //   // Other
//   //   //   'details/buttons': 'buttons',
//   //   //   'details/built-in_speakers': 'speakers',
//   //   //   'details/warranty': 'warranty',
//   //   //   'details/memory_card_readers': 'memory_card_readers',
//   //   //   'details/type_of_memory': 'memory_type',
//   //   //   'details/release_year': 'release_year',
//   //   //   'details/operating_system_os': 'os_version',
//   //   // };

//   //   const attributeMapping: Record<string, string> = {
//   //     // Basic specs
//   //     'details/brand': 'brand_detail',
//   //     'details/operating_system': 'operating_system',
//   //     'details/screen_size': 'screen',
//   //     'details/ram': 'ram',
//   //     'details/internal_storage_space': 'storage',
//   //     'details/model': 'model',
//   //     'details/pta_approved': 'pta_approved',

//   //     // Display
//   //     'details/display_technology': 'display_technology',
//   //     'details/display': 'display_features',
//   //     'details/screen_resolution': 'screen_resolution',
//   //     'details/pixel_density': 'pixel_density',
//   //     'details/dual_screens': 'dual_screens',
//   //     'details/scratch_resistant_display': 'scratch_resistant',

//   //     // Processor
//   //     'details/processor': 'processor',
//   //     'details/processor_core_type': 'processor_core_type',
//   //     'details/cpu_type': 'cpu',
//   //     'details/chipset': 'chipset',
//   //     'details/graphics_processor_type': 'gpu',
//   //     'details/processor_chip': 'chipset',

//   //     // Camera
//   //     'details/built-in_camera': 'built_in_camera',
//   //     'details/number_of_cameras': 'number_of_cameras',
//   //     'details/front_camera_resolution': 'front_camera',
//   //     'details/main_camera_resolution': 'main_camera',
//   //     'details/rear_camera': 'camera_features',
//   //     'details/front_camera': 'front_camera_features',
//   //     'details/auto_focus': 'auto_focus',
//   //     'details/built-in_flash': 'flash',
//   //     'details/video_recorder': 'video_recorder',

//   //     // Connectivity
//   //     'details/4g_lte': '4g',
//   //     'details/5g_support': '5g',
//   //     'details/bluetooth': 'bluetooth',
//   //     'details/nfc_support': 'nfc',
//   //     'details/wifi_wireless_fidelity': 'wifi',
//   //     'details/sim': 'sim_slot',
//   //     'details/sim_type': 'sim_slot_type',
//   //     'details/dual_sim_card_support': 'dual_sim',

//   //     // Ports & Features
//   //     'details/type_of_connection': 'usb_type',
//   //     'details/charging_via_usb': 'charging_via_usb',
//   //     'details/headphone_port': 'headphone_port',
//   //     'details/sd_card': 'sd_card_support',

//   //     // Security
//   //     'details/security': 'security',
//   //     'details/sensors': 'sensors',
//   //     'details/finger_print': 'fingerprint',
//   //     'details/face_id': 'face_id',

//   //     // Physical
//   //     'details/colour': 'colors',
//   //     'details/dimensions_wxhxd': 'dimensions',
//   //     'details/weight': 'weight',
//   //     'details/body': 'body',
//   //     'details/colors': 'available_colors',
//   //     'details/build': 'build_type',

//   //     // Battery
//   //     'details/battery_capacity': 'battery_capacity',
//   //     'details/battery_type': 'battery_type',
//   //     'details/built-in_wireless_charging': 'wireless_charging',
//   //     'details/support_fast_charging': 'fast_charging',
//   //     'details/battery_&_charging': 'battery_info',

//   //     // Other
//   //     'details/warranty': 'warranty',
//   //     'details/release_year': 'release_year',
//   //     'details/ip_code_level_of_dust/water_resistance': 'ip_rating',
//   //     'details/water_resistant': 'water_resistant',
//   //     'details/voice_dialing': 'voice_dialing',
//   //     'details/maximum_numbers_of_fps_when_recording': 'video_fps',
//   //     'details/feature': 'additional_features',
//   //   };

//   //   // Attributes extract karo
//   //   Object.keys(attributeMapping).forEach((csvKey) => {
//   //     const value = row[csvKey]?.toString().trim();
//   //     if (value && value !== '' && value !== 'undefined' && value !== 'null') {
//   //       attributes[attributeMapping[csvKey]] = value;
//   //     }
//   //   });

//   //   return {
//   //     product_title: fullTitle,
//   //     slug: this.slugify(fullTitle),
//   //     description: description,
//   //     attributes: attributes,
//   //     image: row['image']?.trim() || '',
//   //     price: this.convertNumber(finalPrice),
//   //     discount_off: this.convertNumber(discount),
//   //   };
//   // }

//   private createVariant(row: any, fullTitle: string): ProductVariant {
//     const description = row['description'] || fullTitle;

//     const priceStr = row['price']?.toString() || '0';
//     let finalPrice = '0';
//     let discount = '0';

//     if (
//       priceStr === '0' ||
//       priceStr.toLowerCase().includes('coming soon') ||
//       priceStr.toLowerCase().includes('n/a')
//     ) {
//       finalPrice = '0';
//       discount = '0';
//     } else {
//       const priceMatch = priceStr.match(/Rs\.\s*([\d,]+)/g);
//       if (priceMatch && priceMatch.length > 0) {
//         const lastPrice = priceMatch[priceMatch.length - 1];
//         finalPrice = lastPrice.replace(/Rs\.\s*/g, '').replace(/,/g, '');
//         const discountMatch = priceStr.match(/-(\d+)%/);
//         if (discountMatch) discount = discountMatch[1];
//       }
//     }

//     const attributes: Record<string, any> = {};

//     // CSV row ke keys ko lowercase me convert karo
//     const rowKeysLower: Record<string, string> = {};
//     Object.keys(row).forEach((k) => {
//       rowKeysLower[k.toLowerCase().trim()] = k;
//     });

//     // Attribute mapping ke through values assign karo
//     const attributeMapping: Record<string, string> = {
//       // Basic specs
//       'details/brand': 'brand_detail',
//       'details/operating_system': 'operating_system',
//       'details/screen_size': 'screen',
//       'details/ram': 'ram',
//       'details/internal_storage_space': 'storage',
//       'details/model': 'model',
//       'details/pta_approved': 'pta_approved',

//       // Display
//       'details/display_technology': 'display_technology',
//       'details/display': 'display_features',
//       'details/screen_resolution': 'screen_resolution',
//       'details/pixel_density': 'pixel_density',
//       'details/dual_screens': 'dual_screens',
//       'details/scratch_resistant_display': 'scratch_resistant',

//       // Processor
//       'details/processor': 'processor',
//       'details/processor_core_type': 'processor_core_type',
//       'details/cpu_type': 'cpu',
//       'details/chipset': 'chipset',
//       'details/graphics_processor_type': 'gpu',
//       'details/processor_chip': 'chipset',

//       // Camera
//       'details/built-in_camera': 'built_in_camera',
//       'details/number_of_cameras': 'number_of_cameras',
//       'details/front_camera_resolution': 'front_camera',
//       'details/main_camera_resolution': 'main_camera',
//       'details/rear_camera': 'camera_features',
//       'details/front_camera': 'front_camera_features',
//       'details/auto_focus': 'auto_focus',
//       'details/built-in_flash': 'flash',
//       'details/video_recorder': 'video_recorder',

//       // Connectivity
//       'details/4g_lte': '4g',
//       'details/5g_support': '5g',
//       'details/bluetooth': 'bluetooth',
//       'details/nfc_support': 'nfc',
//       'details/wifi_wireless_fidelity': 'wifi',
//       'details/sim': 'sim_slot',
//       'details/sim_type': 'sim_slot_type',
//       'details/dual_sim_card_support': 'dual_sim',

//       // Ports & Features
//       'details/type_of_connection': 'usb_type',
//       'details/charging_via_usb': 'charging_via_usb',
//       'details/headphone_port': 'headphone_port',
//       'details/sd_card': 'sd_card_support',

//       // Security
//       'details/security': 'security',
//       'details/sensors': 'sensors',
//       'details/finger_print': 'fingerprint',
//       'details/face_id': 'face_id',

//       // Physical
//       'details/colour': 'colors',
//       'details/dimensions_wxhxd': 'dimensions',
//       'details/weight': 'weight',
//       'details/body': 'body',
//       'details/colors': 'available_colors',
//       'details/build': 'build_type',

//       // Battery
//       'details/battery_capacity': 'battery_capacity',
//       'details/battery_type': 'battery_type',
//       'details/built-in_wireless_charging': 'wireless_charging',
//       'details/support_fast_charging': 'fast_charging',
//       'details/battery_&_charging': 'battery_info',

//       // Other
//       'details/warranty': 'warranty',
//       'details/release_year': 'release_year',
//       'details/ip_code_level_of_dust/water_resistance': 'ip_rating',
//       'details/water_resistant': 'water_resistant',
//       'details/voice_dialing': 'voice_dialing',
//       'details/maximum_numbers_of_fps_when_recording': 'video_fps',
//       'details/feature': 'additional_features',
//     };

//     Object.entries(attributeMapping).forEach(([csvKey, attrKey]) => {
//       const lowerCsvKey = csvKey.toLowerCase();
//       if (rowKeysLower[lowerCsvKey]) {
//         const value = row[rowKeysLower[lowerCsvKey]]?.toString().trim();
//         if (
//           value &&
//           value !== '' &&
//           value !== 'undefined' &&
//           value !== 'null'
//         ) {
//           attributes[attrKey] = value;
//         }
//       }
//     });

//     return {
//       product_title: fullTitle,
//       slug: this.slugify(fullTitle),
//       description,
//       attributes,
//       image: row['image']?.trim() || '',
//       price: this.convertNumber(finalPrice),
//       discount_off: this.convertNumber(discount),
//     };
//   }

//   /**
//    * Output ko desired format mein convert karta hai
//    */
//   // convertToDesiredFormat(products: ParsedProduct[]): any[] {
//   //   const output: any[] = [];

//   //   products.forEach((product) => {
//   //     product.variants.forEach((variant) => {
//   //       output.push({
//   //         Brand: product.brand,
//   //         'Main Title': product.main_title,
//   //         'Variants/Product title': variant.product_title,
//   //         'Variants/Description': variant.description,

//   //         // Core specs
//   //         'variants/attributes/ram': variant.attributes.ram || '',
//   //         'variants/attributes/storage': variant.attributes.storage || '',
//   //         'variants/attributes/colors': variant.attributes.colors || '',
//   //         'variants/image': variant.image,
//   //         'variants/price': variant.price,
//   //         'variants/discount off': variant.discount_off,

//   //         // Display
//   //         'variants/attributes/screen': variant.attributes.screen || '',
//   //         'variants/attributes/screen resolution':
//   //           variant.attributes.screen_resolution || '',
//   //         'variants/attributes/display technology':
//   //           variant.attributes.display_technology || '',
//   //         'variants/attributes/display features':
//   //           variant.attributes.display_features || '',
//   //         'variants/attributes/pixel density':
//   //           variant.attributes.pixel_density || '',
//   //         'variants/attributes/touch screen':
//   //           variant.attributes.touch_screen || '',
//   //         'variants/attributes/refresh rate':
//   //           variant.attributes.refresh_rate || '',

//   //         // Processor
//   //         'variants/attributes/processor': variant.attributes.processor || '',
//   //         'variants/attributes/processor core type':
//   //           variant.attributes.processor_core_type || '',
//   //         'variants/attributes/cpu': variant.attributes.cpu || '',
//   //         'variants/attributes/chipset': variant.attributes.chipset || '',
//   //         'variants/attributes/gpu': variant.attributes.gpu || '',

//   //         // Operating System
//   //         'variants/attributes/operating system':
//   //           variant.attributes.operating_system || '',
//   //         'variants/attributes/os version': variant.attributes.os_version || '',

//   //         // Camera
//   //         'variants/attributes/built in camera':
//   //           variant.attributes.built_in_camera || '',
//   //         'variants/attributes/number of cameras':
//   //           variant.attributes.number_of_cameras || '',
//   //         'variants/attributes/front camera':
//   //           variant.attributes.front_camera || '',
//   //         'variants/attributes/main camera':
//   //           variant.attributes.main_camera || '',
//   //         'variants/attributes/camera features':
//   //           variant.attributes.camera_features || '',

//   //         // Connectivity
//   //         'variants/attributes/4g': variant.attributes['4g'] || '',
//   //         'variants/attributes/5g': variant.attributes['5g'] || '',
//   //         'variants/attributes/bluetooth': variant.attributes.bluetooth || '',
//   //         'variants/attributes/bluetooth profile':
//   //           variant.attributes.bluetooth_profile || '',
//   //         'variants/attributes/wifi': variant.attributes.wifi || '',
//   //         'variants/attributes/nfc': variant.attributes.nfc || '',
//   //         'variants/attributes/sim slot': variant.attributes.sim_slot || '',

//   //         // Ports & Features
//   //         'variants/attributes/usb': variant.attributes.usb || '',
//   //         'variants/attributes/charging via usb':
//   //           variant.attributes.charging_via_usb || '',
//   //         'variants/attributes/headphone port':
//   //           variant.attributes.headphone_port || '',
//   //         'variants/attributes/stylus support':
//   //           variant.attributes.stylus_support || '',

//   //         // Security
//   //         'variants/attributes/security': variant.attributes.security || '',
//   //         'variants/attributes/sensors': variant.attributes.sensors || '',

//   //         // Physical
//   //         'variants/attributes/dimensions': variant.attributes.dimensions || '',
//   //         'variants/attributes/weight': variant.attributes.weight || '',
//   //         'variants/attributes/body': variant.attributes.body || '',

//   //         // Battery
//   //         'variants/attributes/battery capacity':
//   //           variant.attributes.battery_capacity || '',
//   //         'variants/attributes/battery type':
//   //           variant.attributes.battery_type || '',
//   //         'variants/attributes/wireless charging':
//   //           variant.attributes.wireless_charging || '',
//   //         'variants/attributes/fast charging':
//   //           variant.attributes.fast_charging || '',

//   //         // Other
//   //         'variants/attributes/buttons': variant.attributes.buttons || '',
//   //         'variants/attributes/speakers': variant.attributes.speakers || '',
//   //         'variants/attributes/warranty': variant.attributes.warranty || '',
//   //         'variants/attributes/release year':
//   //           variant.attributes.release_year || '',
//   //         'variants/attributes/memory type':
//   //           variant.attributes.memory_type || '',
//   //       });
//   //     });
//   //   });

//   //   return output;
//   // }

//   convertToDesiredFormat(products: ParsedProduct[]): any[] {
//     const output: any[] = [];

//     products.forEach((product) => {
//       product.variants.forEach((variant) => {
//         const mappedAttributes: Record<string, any> = {};

//         // variant.attributes ke har key ko loop me daalo
//         Object.entries(variant.attributes).forEach(([key, value]) => {
//           mappedAttributes[`variants/attributes/${key}`] = value ?? '';
//         });

//         output.push({
//           Brand: product.brand,
//           'Main Title': product.main_title,
//           'Variants/Product title': variant.product_title,
//           'Variants/Description': variant.description,
//           'variants/image': variant.image,
//           'variants/price': variant.price,
//           'variants/discount off': variant.discount_off,
//           ...mappedAttributes, // dynamically attributes spread kar diye
//         });
//       });
//     });

//     return output;
//   }

//   /**
//    * Products ko CSV format mein save karta hai
//    */
//   async saveToCsvFile(products: any[], outputPath: string): Promise<void> {
//     const dir = path.dirname(outputPath);
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     const csv = Papa.unparse(products);
//     fs.writeFileSync(outputPath, csv, 'utf-8');
//     console.log(`✓ CSV saved to ${outputPath}`);
//   }

//   /**
//    * Products ko JSON file mein save karta hai
//    */
//   async saveToJsonFile(products: any[], outputPath: string): Promise<void> {
//     const dir = path.dirname(outputPath);
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     const jsonData = JSON.stringify(products, null, 2);
//     fs.writeFileSync(outputPath, jsonData, 'utf-8');
//     console.log(`✓ JSON saved to ${outputPath}`);
//   }

//   /**
//    * Statistics generate karta hai
//    */
//   generateStats(products: ParsedProduct[]) {
//     const totalVariants = products.reduce(
//       (sum, p) => sum + p.variants.length,
//       0,
//     );
//     const brandCounts = new Map<string, number>();

//     products.forEach((product) => {
//       const count = brandCounts.get(product.brand) || 0;
//       brandCounts.set(product.brand, count + 1);
//     });

//     return {
//       total_products: products.length,
//       total_variants: totalVariants,
//       brands: Array.from(brandCounts.entries()).map(([brand, count]) => ({
//         brand,
//         product_count: count,
//       })),
//     };
//   }

//   convertNumber(value: string | number | null | undefined): number {
//     if (value === null || value === undefined) return 0;
//     if (typeof value === 'number') return value;
//     return Number(value.replace(/,/g, '')) || 0;
//   }

//   private slugify(text: string) {
//     return text
//       .toLowerCase()
//       .replace(/ /g, '-')
//       .replace(/[^\w-]+/g, '');
//   }

//   private parseProductTitle(
//     brands: string[],
//     mainTitles: string[],
//     fullTitle: string,
//   ) {
//     let variantTitle = fullTitle;

//     // Remove brand from title
//     for (const b of brands) {
//       if (variantTitle.toLowerCase().startsWith(b.toLowerCase())) {
//         variantTitle = variantTitle.slice(b.length).trim();
//         break;
//       }
//     }

//     // Remove main title from variant title
//     for (const mt of mainTitles) {
//       if (variantTitle.toLowerCase().startsWith(mt.toLowerCase())) {
//         variantTitle = variantTitle.slice(mt.length).trim();
//         break;
//       }
//     }

//     return {
//       variantTitle,
//     };
//   }
// }

// // ----------------------------------------------  MEGA APPLE WATCH  --------------------------------------------------------------

// /* eslint-disable @typescript-eslint/require-await */
// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
// import { Injectable } from '@nestjs/common';
// import * as Papa from 'papaparse';
// import * as fs from 'fs';
// import * as path from 'path';

// interface ParsedProduct {
//   brand: string;
//   main_title: string;
//   variants: ProductVariant[];
// }

// interface ProductVariant {
//   product_title: string;
//   slug: string;
//   description: string;
//   attributes: Record<string, any>;
//   image: string;
//   price: number;
//   discount_off: number;
// }

// @Injectable()
// export class MegaLaptopParserService {
//   /**
//    * CSV file ko parse karke structured products array return karta hai
//    */
//   async parseCsvToProducts(filePath: string): Promise<ParsedProduct[]> {
//     const csvData = fs.readFileSync(filePath, 'utf-8');

//     return new Promise((resolve, reject) => {
//       Papa.parse(csvData, {
//         header: true,
//         skipEmptyLines: true,
//         complete: (results) => {
//           try {
//             const products = this.processRows(results.data);
//             resolve(products);
//           } catch (error) {
//             reject(error);
//           }
//         },
//         error: (error) => {
//           reject(error);
//         },
//       });
//     });
//   }

//   /**
//    * Rows ko process karke products structure banata hai
//    */
//   private processRows(rows: any[]): ParsedProduct[] {
//     const productsMap = new Map<string, ParsedProduct>();

//     rows.forEach((row) => {
//       // Title se Brand aur Main Title extract karo
//       const fullTitle = row['title']?.trim();
//       if (!fullTitle) return;

//       const { brand, mainTitle } = this.extractBrandAndMainTitle(fullTitle);
//       const productKey = `${brand}___${mainTitle}`;

//       // Agar product pehle se exist nahi karta to create karo
//       if (!productsMap.has(productKey)) {
//         productsMap.set(productKey, {
//           brand: brand,
//           main_title: mainTitle,
//           variants: [],
//         });
//       }

//       // Variant create karo
//       const extractTitle = this.parseProductTitle(
//         [brand],
//         [mainTitle],
//         fullTitle,
//       );
//       const variant = this.createVariant(row, extractTitle.variantTitle);
//       productsMap.get(productKey)!.variants.push(variant);
//     });

//     return Array.from(productsMap.values());
//   }

//   /**
//    * Title se Brand aur Main Title extract karta hai
//    * Mac Mini specific patterns
//    */
//   private extractBrandAndMainTitle(fullTitle: string): {
//     brand: string;
//     mainTitle: string;
//   } {
//     const parts = fullTitle.split(' ');

//     // Brand extract karo (Apple)
//     const brand = /^[A-Za-z]+$/.test(parts[0]) ? parts[0] : 'Unknown';

//     let mainTitle = 'Mac Mini';

//     // Mac Mini M4, Mac Mini M2, Mac Mini M2 Pro patterns
//     const macMiniMatch = fullTitle.match(/iMac\s+(M\d+(?:\s+Pro)?)/i);

//     if (macMiniMatch) {
//       const chipModel = macMiniMatch[0]; // M4, M2, M2 Pro
//       mainTitle = `${chipModel}`;
//     }

//     return { brand, mainTitle };
//   }

//   /**
//    * Single row se variant object banata hai
//    */
//   private createVariant(row: any, fullTitle: string): ProductVariant {
//     const description = row['description'] || fullTitle;

//     // Price parsing
//     const priceStr = row['price']?.toString() || '0';
//     let finalPrice = '0';
//     let discount = '0';

//     if (
//       priceStr === '0' ||
//       priceStr.toLowerCase().includes('coming soon') ||
//       priceStr.toLowerCase().includes('n/a')
//     ) {
//       finalPrice = '0';
//       discount = '0';
//     } else {
//       const priceMatch = priceStr.match(/Rs\.\s*([\d,]+)/g);
//       if (priceMatch && priceMatch.length > 0) {
//         const lastPrice = priceMatch[priceMatch.length - 1];
//         finalPrice = lastPrice.replace(/Rs\.\s*/g, '').replace(/,/g, '');
//         const discountMatch = priceStr.match(/-(\d+)%/);
//         if (discountMatch) discount = discountMatch[1];
//       }
//     }

//     const attributes: Record<string, any> = {};

//     // CSV column names ko normalize karo
//     const normalizedRow: Record<string, string> = {};
//     Object.keys(row).forEach((key) => {
//       const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
//       normalizedRow[normalizedKey] = row[key];
//     });

//     // Mac Mini specific attribute mapping
//     const attributeMapping: Record<string, string> = {
//       // Basic specs
//       'details/brand': 'brand',
//       'details/processor_type_/_chip': 'chip',
//       'details/processor_speed': 'processor_speed',
//       'details/processor_model': 'processor_model',
//       'details/no_of_cores': 'cpu_cores',

//       // Memory & Storage
//       'details/ram_size': 'ram',
//       'details/memory': 'storage',
//       'details/type_of_memory': 'memory_type',
//       'details/type': 'storage_type',
//       'details/memory_card_slot': 'memory_card_slot',

//       // Graphics
//       'details/dedicated_graphics_memory': 'dedicated_graphics',
//       'details/graphics_memory': 'graphics_memory',
//       'details/type_of_graphics_memory': 'graphics_memory_type',

//       // Operating System
//       'details/operating_system': 'operating_system',

//       // Physical
//       'details/colors': 'colors',
//       'details/dimensions_wxhxd': 'dimensions',
//       'details/weight': 'weight',

//       // Ports & Connectivity
//       'details/displayport': 'displayport',
//       'details/type_c_port': 'type_c_port',
//       'details/hdmi': 'hdmi',
//       'details/3.5_mm_headphone_jack': 'headphone_jack',
//       'details/thunderbolt': 'thunderbolt',
//       'details/number_of_thunderbolt_ports': 'thunderbolt_ports',
//       'details/usb': 'usb',
//       'details/usb_3.0': 'usb_3',
//       'details/ports': 'ports',
//       'details/bluetooth': 'bluetooth',
//       'details/lan': 'lan',
//       'details/wireless_network': 'wireless_network',

//       // Other
//       'details/fingerprint_reader': 'fingerprint_reader',
//       'details/numeric_keyboard': 'numeric_keyboard',
//       'details/backlit_keyboard': 'backlit_keyboard',
//       'details/warranty': 'warranty',
//     };

//     // Attributes extract karo
//     Object.entries(attributeMapping).forEach(([csvKey, attrKey]) => {
//       const normalizedCsvKey = csvKey.toLowerCase().trim().replace(/\s+/g, '_');

//       if (normalizedRow[normalizedCsvKey]) {
//         const value = normalizedRow[normalizedCsvKey]?.toString().trim();
//         if (
//           value &&
//           value !== '' &&
//           value !== 'undefined' &&
//           value !== 'null'
//         ) {
//           attributes[attrKey] = value;
//         }
//       }
//     });

//     return {
//       product_title: fullTitle,
//       slug: this.slugify(fullTitle),
//       description,
//       attributes,
//       image: row['images/0']?.trim() || '',
//       price: this.convertNumber(finalPrice),
//       discount_off: this.convertNumber(discount),
//     };
//   }

//   /**
//    * Output ko desired format mein convert karta hai
//    */
//   convertToDesiredFormat(products: ParsedProduct[]): any[] {
//     const output: any[] = [];

//     products.forEach((product) => {
//       product.variants.forEach((variant) => {
//         const mappedAttributes: Record<string, any> = {};

//         // Dynamic attributes spread karo
//         Object.entries(variant.attributes).forEach(([key, value]) => {
//           mappedAttributes[`variants/attributes/${key}`] = value ?? '';
//         });

//         output.push({
//           Brand: product.brand,
//           'Main Title': product.main_title,
//           'Variants/Product title': variant.product_title,
//           'Variants/Description': variant.description,
//           'variants/image': variant.image,
//           'variants/price': variant.price,
//           'variants/discount off': variant.discount_off,
//           ...mappedAttributes,
//         });
//       });
//     });

//     return output;
//   }

//   /**
//    * Products ko CSV format mein save karta hai
//    */
//   async saveToCsvFile(products: any[], outputPath: string): Promise<void> {
//     const dir = path.dirname(outputPath);
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     const csv = Papa.unparse(products);
//     fs.writeFileSync(outputPath, csv, 'utf-8');
//     console.log(`✓ CSV saved to ${outputPath}`);
//   }

//   /**
//    * Products ko JSON file mein save karta hai
//    */
//   async saveToJsonFile(products: any[], outputPath: string): Promise<void> {
//     const dir = path.dirname(outputPath);
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     const jsonData = JSON.stringify(products, null, 2);
//     fs.writeFileSync(outputPath, jsonData, 'utf-8');
//     console.log(`✓ JSON saved to ${outputPath}`);
//   }

//   /**
//    * Statistics generate karta hai
//    */
//   generateStats(products: ParsedProduct[]) {
//     const totalVariants = products.reduce(
//       (sum, p) => sum + p.variants.length,
//       0,
//     );
//     const brandCounts = new Map<string, number>();

//     products.forEach((product) => {
//       const count = brandCounts.get(product.brand) || 0;
//       brandCounts.set(product.brand, count + 1);
//     });

//     return {
//       total_products: products.length,
//       total_variants: totalVariants,
//       brands: Array.from(brandCounts.entries()).map(([brand, count]) => ({
//         brand,
//         product_count: count,
//       })),
//     };
//   }

//   convertNumber(value: string | number | null | undefined): number {
//     if (value === null || value === undefined) return 0;
//     if (typeof value === 'number') return value;
//     return Number(value.replace(/,/g, '')) || 0;
//   }

//   private slugify(text: string) {
//     return text
//       .toLowerCase()
//       .replace(/ /g, '-')
//       .replace(/[^\w-]+/g, '');
//   }

//   private parseProductTitle(
//     brands: string[],
//     mainTitles: string[],
//     fullTitle: string,
//   ) {
//     let variantTitle = fullTitle;

//     // Remove brand from title
//     for (const b of brands) {
//       if (variantTitle.toLowerCase().startsWith(b.toLowerCase())) {
//         variantTitle = variantTitle.slice(b.length).trim();
//         break;
//       }
//     }

//     // Remove main title from variant title
//     for (const mt of mainTitles) {
//       if (variantTitle.toLowerCase().startsWith(mt.toLowerCase())) {
//         variantTitle = variantTitle.slice(mt.length).trim();
//         break;
//       }
//     }

//     return {
//       variantTitle,
//     };
//   }
// }

// // ----------------------------------------------  PAKLAP ALL LAPTOPS  --------------------------------------------------------------

// /* eslint-disable @typescript-eslint/require-await */
// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
// import { Injectable } from '@nestjs/common';
// import * as Papa from 'papaparse';
// import * as fs from 'fs';
// import * as path from 'path';

// interface ParsedProduct {
//   brand: string;
//   main_title: string;
//   variants: ProductVariant[];
// }

// interface ProductVariant {
//   product_title: string;
//   slug: string;
//   description: string;
//   attributes: Record<string, any>;
//   image: string;
//   price: number;
//   discount_off: number;
// }

// @Injectable()
// export class MegaLaptopParserService {
//   /**
//    * CSV file ko parse karke structured products array return karta hai
//    */
//   async parseCsvToProducts(filePath: string): Promise<ParsedProduct[]> {
//     const csvData = fs.readFileSync(filePath, 'utf-8');

//     return new Promise((resolve, reject) => {
//       Papa.parse(csvData, {
//         header: true,
//         skipEmptyLines: true,
//         complete: (results) => {
//           try {
//             const products = this.processRows(results.data);
//             resolve(products);
//           } catch (error) {
//             reject(error);
//           }
//         },
//         error: (error) => {
//           reject(error);
//         },
//       });
//     });
//   }

//   /**
//    * Rows ko process karke products structure banata hai
//    */
//   private processRows(rows: any[]): ParsedProduct[] {
//     const productsMap = new Map<string, ParsedProduct>();

//     rows.forEach((row) => {
//       // Title se Brand aur Main Title extract karo
//       const fullTitle = row['title']?.trim();
//       if (!fullTitle) return;

//       const { brand, mainTitle } = this.extractBrandAndMainTitle(fullTitle);
//       const productKey = `${brand}___${mainTitle}`;

//       // Agar product pehle se exist nahi karta to create karo
//       if (!productsMap.has(productKey)) {
//         productsMap.set(productKey, {
//           brand: brand,
//           main_title: mainTitle,
//           variants: [],
//         });
//       }

//       // Variant create karo
//       const extractTitle = this.parseProductTitle(
//         [brand],
//         [mainTitle],
//         fullTitle,
//       );
//       const variant = this.createVariant(row, extractTitle.variantTitle);
//       productsMap.get(productKey)!.variants.push(variant);
//     });

//     return Array.from(productsMap.values());
//   }

//   /**
//    * Title se Brand aur Main Title extract karta hai
//    * Mac Mini specific patterns
//    */
//   private extractBrandAndMainTitle(fullTitle: string): {
//     brand: string;
//     mainTitle: string;
//   } {
//     const parts = fullTitle.split(' ');
//     const brand = parts[0] || 'Unknown';

//     // Pehle 3 words ko Main Title maan letay hain (e.g., HP Victus 15)
//     // Aap isko mazeed refine kar saktay hain
//     const mainTitle = parts.slice(1, 3).join(' ');

//     return { brand, mainTitle };
//   }

//   /**
//    * Single row se variant object banata hai
//    */
//   private createVariant(row: any, fullTitle: string): ProductVariant {
//     const description = row['description'] || fullTitle;

//     // Price parsing
//     const priceStr = row['price']?.toString() || '0';
//     let finalPrice = '0';
//     let discount = '0';

//     if (
//       priceStr === '0' ||
//       priceStr.toLowerCase().includes('coming soon') ||
//       priceStr.toLowerCase().includes('n/a')
//     ) {
//       finalPrice = '0';
//       discount = '0';
//     } else {
//       const priceMatch = priceStr.match(/Rs\.\s*([\d,]+)/g);
//       if (priceMatch && priceMatch.length > 0) {
//         const lastPrice = priceMatch[priceMatch.length - 1];
//         finalPrice = lastPrice.replace(/Rs\.\s*/g, '').replace(/,/g, '');
//         const discountMatch = priceStr.match(/-(\d+)%/);
//         if (discountMatch) discount = discountMatch[1];
//       }
//     }

//     const attributes: Record<string, any> = {};

//     // CSV column names ko normalize karo
//     const normalizedRow: Record<string, string> = {};
//     Object.keys(row).forEach((key) => {
//       const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
//       normalizedRow[normalizedKey] = row[key];
//     });

//     // Mac Mini specific attribute mapping
//     const attributeMapping: Record<string, string> = {
//       // Basic specs
//       'details/brand': 'brand',
//       'details/processor_type_/_chip': 'chip',
//       'details/processor_speed': 'processor_speed',
//       'details/processor_model': 'processor_model',
//       'details/no_of_cores': 'cpu_cores',
//       'details/generation': 'generations',

//       // Memory & Storage
//       'details/installed_ram': 'ram',
//       'details/hard_drive_size': 'storage',
//       'details/type_of_memory': 'memory_type',
//       'details/type': 'wifi_type',
//       'details/memory_card_slot': 'memory_card_slot',

//       // Graphics
//       'details/dedicated_graphics_memory': 'dedicated_graphics',
//       'details/graphics_memory': 'graphics_memory',
//       'details/type_of_graphics_memory': 'graphics_memory_type',

//       // Operating System
//       'details/operating_system': 'operating_system',

//       // Physical
//       'details/colors': 'colors',
//       'details/dimensions_wxhxd': 'dimensions',
//       'details/weight': 'weight',

//       // Ports & Connectivity
//       'details/displayport': 'displayport',
//       'details/type_c_port': 'type_c_port',
//       'details/hdmi': 'hdmi',
//       'details/3.5_mm_headphone_jack': 'headphone_jack',
//       'details/thunderbolt': 'thunderbolt',
//       'details/number_of_thunderbolt_ports': 'thunderbolt_ports',
//       'details/usb': 'usb',
//       'details/usb_3.0': 'usb_3',
//       'details/ports': 'ports',
//       'details/bluetooth': 'bluetooth',
//       'details/lan': 'lan',
//       'details/wireless_network': 'wireless_network',

//       // Other
//       'details/fingerprint_reader': 'fingerprint_reader',
//       'details/numeric_keyboard': 'numeric_keyboard',
//       'details/backlit_keyboard': 'backlit_keyboard',
//       'details/warranty': 'warranty',
//     };

//     // Attributes extract karo
//     Object.entries(attributeMapping).forEach(([csvKey, attrKey]) => {
//       const normalizedCsvKey = csvKey.toLowerCase().trim().replace(/\s+/g, '_');

//       if (normalizedRow[normalizedCsvKey]) {
//         const value = normalizedRow[normalizedCsvKey]?.toString().trim();
//         if (
//           value &&
//           value !== '' &&
//           value !== 'undefined' &&
//           value !== 'null'
//         ) {
//           attributes[attrKey] = value;
//         }
//       }
//     });

//     return {
//       product_title: fullTitle,
//       slug: this.slugify(fullTitle),
//       description,
//       attributes,
//       image: row['images/0']?.trim() || '',
//       price: this.convertNumber(finalPrice),
//       discount_off: this.convertNumber(discount),
//     };
//   }

//   /**
//    * Output ko desired format mein convert karta hai
//    */
//   convertToDesiredFormat(products: ParsedProduct[]): any[] {
//     const output: any[] = [];

//     products.forEach((product) => {
//       product.variants.forEach((variant) => {
//         const mappedAttributes: Record<string, any> = {};

//         // Dynamic attributes spread karo
//         Object.entries(variant.attributes).forEach(([key, value]) => {
//           mappedAttributes[`variants/attributes/${key}`] = value ?? '';
//         });

//         output.push({
//           Brand: product.brand,
//           'Main Title': product.main_title,
//           'Variants/Product title': variant.product_title,
//           'Variants/Description': variant.description,
//           'variants/image': variant.image,
//           'variants/price': variant.price,
//           'variants/discount off': variant.discount_off,
//           ...mappedAttributes,
//         });
//       });
//     });

//     return output;
//   }

//   /**
//    * Products ko CSV format mein save karta hai
//    */
//   async saveToCsvFile(products: any[], outputPath: string): Promise<void> {
//     const dir = path.dirname(outputPath);
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     const csv = Papa.unparse(products);
//     fs.writeFileSync(outputPath, csv, 'utf-8');
//     console.log(`✓ CSV saved to ${outputPath}`);
//   }

//   /**
//    * Products ko JSON file mein save karta hai
//    */
//   async saveToJsonFile(products: any[], outputPath: string): Promise<void> {
//     const dir = path.dirname(outputPath);
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     const jsonData = JSON.stringify(products, null, 2);
//     fs.writeFileSync(outputPath, jsonData, 'utf-8');
//     console.log(`✓ JSON saved to ${outputPath}`);
//   }

//   /**
//    * Statistics generate karta hai
//    */
//   generateStats(products: ParsedProduct[]) {
//     const totalVariants = products.reduce(
//       (sum, p) => sum + p.variants.length,
//       0,
//     );
//     const brandCounts = new Map<string, number>();

//     products.forEach((product) => {
//       const count = brandCounts.get(product.brand) || 0;
//       brandCounts.set(product.brand, count + 1);
//     });

//     return {
//       total_products: products.length,
//       total_variants: totalVariants,
//       brands: Array.from(brandCounts.entries()).map(([brand, count]) => ({
//         brand,
//         product_count: count,
//       })),
//     };
//   }

//   convertNumber(value: string | number | null | undefined): number {
//     if (value === null || value === undefined) return 0;
//     if (typeof value === 'number') return value;
//     return Number(value.replace(/,/g, '')) || 0;
//   }

//   private slugify(text: string) {
//     return text
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/^-+|-+$/g, '');
//   }

//   private parseProductTitle(
//     brands: string[],
//     mainTitles: string[],
//     fullTitle: string,
//   ) {
//     let variantTitle = fullTitle;

//     // Remove brand from title
//     for (const b of brands) {
//       if (variantTitle.toLowerCase().startsWith(b.toLowerCase())) {
//         variantTitle = variantTitle.slice(b.length).trim();
//         break;
//       }
//     }

//     // Remove main title from variant title
//     for (const mt of mainTitles) {
//       if (variantTitle.toLowerCase().startsWith(mt.toLowerCase())) {
//         variantTitle = variantTitle.slice(mt.length).trim();
//         break;
//       }
//     }

//     return {
//       variantTitle,
//     };
//   }
// }

// ---------------------------------------------- PAKLAP DRIVES ----------------------------------------------
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { Injectable } from '@nestjs/common';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import * as path from 'path';

interface ParsedProduct {
  brand: string;
  main_title: string;
  variants: ProductVariant[];
}

interface ProductVariant {
  product_title: string;
  slug: string;
  description: string;
  attributes: Record<string, any>;
  image: string;
  price: number;
  discount_off: number;
}

@Injectable()
export class MegaLaptopParserService {
  /**
   * CSV file ko parse karke structured products array return karta hai
   */
  async parseCsvToProducts(filePath: string): Promise<ParsedProduct[]> {
    const csvData = fs.readFileSync(filePath, 'utf-8');

    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const products = this.processRows(results.data);
            resolve(products);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  /**
   * Rows ko process karke products structure banata hai
   */
  private processRows(rows: any[]): ParsedProduct[] {
    const productsMap = new Map<string, ParsedProduct>();

    rows.forEach((row) => {
      // Title se Brand aur Main Title extract karo
      const fullTitle = row['title']?.trim().toLowerCase();
      if (!fullTitle) return;

      const { brand, mainTitle } = this.extractBrandAndMainTitle(fullTitle);
      const productKey = `${brand}___${mainTitle}`;

      // Agar product pehle se exist nahi karta to create karo
      if (!productsMap.has(productKey)) {
        productsMap.set(productKey, {
          brand: brand,
          main_title: mainTitle,
          variants: [],
        });
      }

      // Variant create karo
      const extractTitle = this.parseProductTitle(
        [brand],
        [mainTitle],
        fullTitle,
      );
      const variant = this.createVariant(row, extractTitle.variantTitle);
      productsMap.get(productKey)!.variants.push(variant);
    });

    return Array.from(productsMap.values());
  }

  /**
   * Title se Brand aur Main Title extract karta hai
   * Storage drives specific patterns (SSD/HDD/USB/NAS)
   */
  private extractBrandAndMainTitle(fullTitle: string): {
    brand: string;
    mainTitle: string;
  } {
    const parts = fullTitle.split(' ');

    // Brand extract karo (Kingston, WD, Samsung, Seagate, etc.)
    const brand = /^[A-Za-z]+$/.test(parts[0]) ? parts[0] : 'Unknown';

    let mainTitle = '';

    // Different drive types ke patterns
    // SSD patterns: "Kingston SSD 2TB NVMe Fury Renegade"
    if (fullTitle.match(/SSD/i)) {
      const ssdMatch = fullTitle.match(/SSD\s+(\d+(?:GB|TB))?/i);
      if (ssdMatch) {
        const capacity = ssdMatch[1]?.trim() || '';
        mainTitle = capacity ? `SSD ${capacity}`.trim() : 'SSD';
      }
    }
    // USB/Flash Drive patterns: "Kingston 64GB USB Drive"
    else if (fullTitle.match(/USB|Flash/i)) {
      const usbMatch = fullTitle.match(/(\d+(?:GB|TB))?\s*USB/i);
      if (usbMatch) {
        const capacity = usbMatch[1]?.trim() || '';
        mainTitle = capacity ? `USB Drive ${capacity}`.trim() : 'USB Drive';
      }
    }
    // NAS patterns: "Synology 4-Bay DiskStation"
    else if (fullTitle.match(/NAS|DiskStation|QNAP/i)) {
      const nasMatch = fullTitle.match(
        /(\d+-Bay)?\s*(DiskStation|NAS|TS-\d+)/i,
      );
      if (nasMatch) {
        mainTitle = nasMatch[0]?.trim();
      } else {
        mainTitle = 'NAS';
      }
    }
    // HDD patterns: "WD Red Plus 10TB"
    else if (fullTitle.match(/HDD|Hard Drive|IronWolf|Exos/i)) {
      const hddMatch = fullTitle.match(
        /(Red|Blue|IronWolf|Exos|My Book)\s+(\d+(?:GB|TB))?/i,
      );
      if (hddMatch) {
        mainTitle = hddMatch[0]?.trim();
      } else {
        mainTitle = 'HDD';
      }
    }
    // Portable SSD: "SanDisk Portable SSD"
    else if (fullTitle.match(/Portable/i)) {
      const portableMatch = fullTitle.match(
        /Portable\s+SSD\s+(\d+(?:GB|TB))?/i,
      );
      if (portableMatch) {
        const capacity = portableMatch[1].trim() || '';
        mainTitle = capacity
          ? `Portable SSD ${capacity}`.trim()
          : 'Portable SSD';
      }
    } else {
      // Fallback: Use first 2-3 words
      mainTitle = parts.slice(1, 3).join(' ');
    }

    return { brand, mainTitle: mainTitle || 'Storage Drive' };
  }

  /**
   * Single row se variant object banata hai
   */
  private createVariant(row: any, fullTitle: string): ProductVariant {
    const description = row['description'] || fullTitle;

    // Price parsing - handle "0" for unavailable products
    const priceStr = row['price']?.toString() || '0';
    let finalPrice = '0';
    let discount = '0';

    if (
      priceStr === '0' ||
      priceStr.toLowerCase().includes('coming soon') ||
      priceStr.toLowerCase().includes('in stock')
    ) {
      finalPrice = '0';
      discount = '0';
    } else {
      const priceMatch = priceStr.match(/Rs\.\s*([\d,]+)/g);
      if (priceMatch && priceMatch.length > 0) {
        const lastPrice = priceMatch[priceMatch.length - 1];
        finalPrice = lastPrice.replace(/Rs\.\s*/g, '').replace(/,/g, '');
        const discountMatch = priceStr.match(/-(\d+)%/);
        if (discountMatch) discount = discountMatch[1];
      }
    }

    const attributes: Record<string, any> = {};

    // CSV column names ko normalize karo
    const normalizedRow: Record<string, string> = {};
    Object.keys(row).forEach((key) => {
      const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
      normalizedRow[normalizedKey] = row[key];
    });

    // Storage drives specific attribute mapping
    const attributeMapping: Record<string, string> = {
      // Core specs
      'details/brand': 'brand',
      'details/capacity': 'capacity',
      'details/interface': 'interface',
      'details/form_factor': 'form_factor',

      // Performance
      'details/read_speed': 'read_speed',
      'details/write_speed': 'write_speed',

      // Physical
      'details/color': 'color',
      'details/availability': 'availability',

      // Additional info
      'details/price': 'price_detail',
    };

    // Attributes extract karo
    Object.entries(attributeMapping).forEach(([csvKey, attrKey]) => {
      const normalizedCsvKey = csvKey.toLowerCase().trim().replace(/\s+/g, '_');

      if (normalizedRow[normalizedCsvKey]) {
        const value = normalizedRow[normalizedCsvKey]?.toString().trim();
        if (
          value &&
          value !== '' &&
          value !== 'undefined' &&
          value !== 'null' &&
          value !== 'N/A' &&
          value.toLowerCase() !== 'in stock'
        ) {
          attributes[attrKey] = value;
        }
      }
    });

    return {
      product_title: fullTitle,
      slug: this.slugify(fullTitle),
      description,
      attributes,
      image: row['images/0']?.trim() || '',
      price: this.convertNumber(finalPrice),
      discount_off: this.convertNumber(discount),
    };
  }

  /**
   * Output ko desired format mein convert karta hai
   */
  convertToDesiredFormat(products: ParsedProduct[]): any[] {
    const output: any[] = [];

    products.forEach((product) => {
      product.variants.forEach((variant) => {
        const mappedAttributes: Record<string, any> = {};

        // Dynamic attributes spread karo
        Object.entries(variant.attributes).forEach(([key, value]) => {
          mappedAttributes[`variants/attributes/${key}`] = value ?? '';
        });

        output.push({
          Brand: product.brand,
          'Main Title': product.main_title,
          'Variants/Product title': variant.product_title,
          'Variants/Description': variant.description,
          'variants/image': variant.image,
          'variants/price': variant.price,
          'variants/discount off': variant.discount_off,
          ...mappedAttributes,
        });
      });
    });

    return output;
  }

  /**
   * Products ko CSV format mein save karta hai
   */
  async saveToCsvFile(products: any[], outputPath: string): Promise<void> {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const csv = Papa.unparse(products);
    fs.writeFileSync(outputPath, csv, 'utf-8');
    console.log(`✓ CSV saved to ${outputPath}`);
  }

  /**
   * Products ko JSON file mein save karta hai
   */
  async saveToJsonFile(products: any[], outputPath: string): Promise<void> {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const jsonData = JSON.stringify(products, null, 2);
    fs.writeFileSync(outputPath, jsonData, 'utf-8');
    console.log(`✓ JSON saved to ${outputPath}`);
  }

  /**
   * Statistics generate karta hai
   */
  generateStats(products: ParsedProduct[]) {
    const totalVariants = products.reduce(
      (sum, p) => sum + p.variants.length,
      0,
    );
    const brandCounts = new Map<string, number>();

    products.forEach((product) => {
      const count = brandCounts.get(product.brand) || 0;
      brandCounts.set(product.brand, count + 1);
    });

    return {
      total_products: products.length,
      total_variants: totalVariants,
      brands: Array.from(brandCounts.entries()).map(([brand, count]) => ({
        brand,
        product_count: count,
      })),
    };
  }

  convertNumber(value: string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    return Number(value.replace(/,/g, '')) || 0;
  }

  private slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  private parseProductTitle(
    brands: string[],
    mainTitles: string[],
    fullTitle: string,
  ) {
    let variantTitle = fullTitle;

    // Remove brand from title
    for (const b of brands) {
      if (variantTitle.toLowerCase().startsWith(b.toLowerCase())) {
        variantTitle = variantTitle.slice(b.length).trim();
        break;
      }
    }

    // Remove main title from variant title
    for (const mt of mainTitles) {
      if (variantTitle.toLowerCase().startsWith(mt.toLowerCase())) {
        variantTitle = variantTitle.slice(mt.length).trim();
        break;
      }
    }

    return {
      variantTitle,
    };
  }
}
