/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// /* eslint-disable @typescript-eslint/no-floating-promises */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// import { Injectable, BadRequestException } from '@nestjs/common';
// import * as fs from 'fs/promises';
// import * as path from 'path';

// interface ProductInput {
//   title: string;
//   description: string;
//   image: string;
//   oldPrice?: string;
//   newPrice?: string;
//   specs: Record<string, any>;
//   seoContent?: string;
//   faqContent?: string;
// }

// interface ProductVariant {
//   product_title: string;
//   slug: string;
//   description: string;
//   attributes: Record<string, any>;
//   image: string;
//   price: number;
//   discount_off: number;
//   seoContent: string;
//   faqContent: string;
// }

// interface ProductGroup {
//   brand: string;
//   main_title: string;
//   variants: ProductVariant[];
// }

// @Injectable()
// export class ProductTransformService {
//   private readonly outputDir = './uploads/transformed'; // Output folder path

//   constructor() {
//     // Output directory ko create karo agar exist nahi karti
//     this.ensureDirectoryExists(this.outputDir);
//   }

//   /**
//    * Directory ko check karo aur create karo agar exist nahi karti
//    */
//   private async ensureDirectoryExists(dirPath: string): Promise<void> {
//     try {
//       await fs.access(dirPath);
//     } catch {
//       await fs.mkdir(dirPath, { recursive: true });
//     }
//   }

//   /**
//    * Brand aur main title extract karo product title se
//    */
//   private extractBrandAndTitle(
//     title: string,
//     brand: string,
//   ): {
//     brand: string;
//     mainTitle: string | null;
//   } {
//     // const brand = 'Apple';

//     // Title ko normalize karo
//     // const normalized = title.replace(/Macbook/gi, 'MacBook');
//     // const normalized = title.replace(/Watch/gi, 'Watch');
//     // const normalized = title.replace(/ipad/gi, 'Ipad');
//     // const normalized = title.replace(/IPhone/gi, 'iPhone');
//     const normalized = title;

//     // Different patterns check mega computer
//     const patterns = [
//       { regex: /TS EVO/i, result: 'TS EVO' }, // Samsung
//       { regex: /1TB/i, result: '1TB' }, // Samsung
//       { regex: /T7/i, result: 'T7' }, // Samsung
//       { regex: /T9/i, result: 'T9' }, // Samsung
//       { regex: /2TB/i, result: '2TB' }, // Samsung
//       { regex: /4TB/i, result: '4TB' }, // Samsung
//       { regex: /1TB/i, result: '1TB' }, // Samsung
//       { regex: /8TB/i, result: '8TB' }, // Samsung
//       { regex: /250GB/i, result: '250GB' }, // Samsung
//       { regex: /PS8/i, result: 'PS8' }, // Lenovo
//       { regex: /PS6/i, result: 'PS6' }, // Lenovo
//       { regex: /10TB 3.5/i, result: '10TB 3.5' }, // Seagate
//       { regex: /8TB 3.5/i, result: '8TB 3.5' }, // Seagate
//       { regex: /6TB 3.5/i, result: '6TB 3.5' }, // Seagate
//       { regex: /4TB 3.5/i, result: '4TB 3.5' }, // Seagate
//       { regex: /Expansion/i, result: 'Expansion' }, // Seagate
//       { regex: /Expansion/i, result: 'Expansion' }, // Seagate
//       { regex: /14TB/i, result: '14TB' }, // Seagate
//       { regex: /12TB/i, result: '12TB' }, // Seagate
//       { regex: /16TB/i, result: '16TB' }, // Seagate
//       { regex: /2TB/i, result: '2TB' }, // Seagate
//       { regex: /E61/i, result: 'E61' }, // Sandisk
//       { regex: /E30/i, result: 'E30' }, // Sandisk
//       { regex: /32GB/i, result: '32GB' }, // Sandisk
//       { regex: /SSD/i, result: 'SSD' }, // Hikvision
//       { regex: /RED/i, result: 'RED' }, // WD
//       { regex: /Blue/i, result: 'Blue' }, // WD
//       { regex: /Green/i, result: 'Green' }, // WD
//       { regex: /12TB 3.5/i, result: '12TB 3.5' }, // WD
//       { regex: /4TB 3.5/i, result: '4TB 3.5' }, // WD
//       { regex: /10TB 3.5/i, result: '10TB 3.5' }, // WD
//       { regex: /14TB 3.5/i, result: '14TB 3.5' }, // WD
//       { regex: /22TB 3.5/i, result: '22TB 3.5' }, // WD
//       { regex: /Ultrastar/i, result: 'Ultrastar' }, // WD
//       { regex: /6TB 3.5/i, result: '6TB 3.5' }, // WD
//       { regex: /8TB 3.5/i, result: '8TB 3.5' }, // WD
//       { regex: /18TB 3.5/i, result: '18TB 3.5' }, // WD
//       { regex: /1TB 3.5/i, result: '1TB 3.5' }, // WD
//       { regex: /2TB 3.5/i, result: '2TB 3.5' }, // WD
//       { regex: /1TB/i, result: '1TB' }, // Kingston
//       { regex: /2TB/i, result: '2TB' }, // Kingston
//       { regex: /4TB/i, result: '4TB' }, // Kingston
//       { regex: /256GB/i, result: '256GB' }, // Kingston
//       { regex: /128GB/i, result: '128GB' }, // Kingston
//       { regex: /500GB/i, result: '500GB' }, // Kingston
//       { regex: /64GB/i, result: '64GB' }, // Kingston
//       { regex: /256GB/i, result: '256GB' }, // Lexar
//       { regex: /2TB/i, result: '2TB' }, // Lexar
//       { regex: /1TB/i, result: '1TB' }, // Lexar
//       { regex: /128GB/i, result: '128GB' }, // Lexar
//       { regex: /512GB/i, result: '512GB' }, // Lexar
//       { regex: /32GB/i, result: '32GB' }, // Lexar
//       { regex: /Legend/i, result: 'Legend' }, // Adata
//       { regex: /Storejet/i, result: 'Storejet' }, // Transcend
//       { regex: /S500/i, result: 'S500' }, // Aigo
//       { regex: /Pocket/i, result: 'Pocket' }, // Hiksemi
//       { regex: /2TB/i, result: '2TB' }, // Verbatim
//       { regex: /1TB/i, result: '1TB' }, // Verbatim
//       { regex: /256GB/i, result: '256GB' }, // Verbatim
//       { regex: /512GB/i, result: '512GB' }, // Verbatim
//       { regex: /SPATIUM/i, result: 'SPATIUM' }, // Msi
//       { regex: /DiskStation/i, result: 'DiskStation' }, // Synology
//       { regex: /Enclosure/i, result: 'Enclosure' }, // QNAP
//       { regex: /Elite/i, result: 'Elite' }, // Corsair
//       { regex: /32GB/i, result: '32GB' }, // DAHUA
//     ];
//     // // Different patterns check mega computer
//     // const patterns = [
//     //   { regex: /Mac Studio/i, result: 'Mac Studio' },
//     //   { regex: /Mac Mini/i, result: 'Mac Mini' },
//     //   { regex: /Mac Pro/i, result: 'Mac Pro' },
//     //   { regex: /iMac/i, result: 'iMac' },
//     // ];
//     // // Different patterns check mega iphone mobiles
//     // const patterns = [
//     //   { regex: /iPhone 16 Pro Max/i, result: 'iPhone 16 Pro Max' },
//     //   { regex: /iPhone 17 Pro Max/i, result: 'iPhone 17 Pro Max' },
//     //   { regex: /iPhone 16 Plus/i, result: 'iPhone 16 Plus' },
//     //   { regex: /iPhone 16 Pro/i, result: 'iPhone 16 Pro' },
//     //   { regex: /iPhone 17 Pro/i, result: 'iPhone 17 Pro' },
//     //   { regex: /iPhone Air/i, result: 'iPhone Air' },
//     //   { regex: /iPhone 17/i, result: 'iPhone 17' },
//     //   { regex: /iPhone 16e/i, result: 'iPhone 16e' },
//     //   { regex: /iPhone 16/i, result: 'iPhone 16' },
//     //   { regex: /iPhone 15/i, result: 'iPhone 15' },
//     //   { regex: /iPhone 14/i, result: 'iPhone 14' },
//     //   { regex: /iPhone 13/i, result: 'iPhone 13' },
//     // ];
//     // // Different patterns check mega tablets (IPAD)
//     // const patterns = [
//     //   { regex: /Ipad Pro 13/i, result: 'Ipad Pro 13' },
//     //   { regex: /Ipad Pro 11/i, result: 'Ipad Pro 11' },
//     //   { regex: /Ipad Air 13/i, result: 'Ipad Air 13' },
//     //   { regex: /Ipad Mini 7/i, result: 'Ipad Mini 7' },
//     //   { regex: /Ipad Air 11/i, result: 'Ipad Air 11' },
//     //   { regex: /Ipad Pro/i, result: 'Ipad Pro' },
//     //   { regex: /Ipad 11/i, result: 'Ipad 11' },
//     // ];
//     // // Different patterns check mega watches
//     // const patterns = [
//     //   { regex: /Watch Series 11/i, result: 'Watch Series 11' },
//     //   { regex: /Watch Series 10/i, result: 'Watch Series 10' },
//     //   { regex: /Watch Ultra 2/i, result: 'Watch Ultra 2' },
//     //   { regex: /Watch Ultra 3/i, result: 'Watch Ultra 3' },
//     //   { regex: /Watch SE/i, result: 'Watch SE' },
//     //   { regex: /Watch SE 3/i, result: 'Watch SE 3' },
//     // ];
//     // //Different patterns check mega laptop
//     // const patterns = [
//     //   { regex: /MacBook Pro 16/i, result: 'MacBook Pro 16' },
//     //   { regex: /MacBook Pro 14/i, result: 'MacBook Pro 14' },
//     //   { regex: /MacBook Air 13/i, result: 'MacBook Air 13' },
//     //   { regex: /MacBook Air 15/i, result: 'MacBook Air 15' },
//     //   { regex: /MacBook Pro/i, result: 'MacBook Pro' },
//     //   { regex: /MacBook Air/i, result: 'MacBook Air' },
//     // ];

//     for (const pattern of patterns) {
//       if (pattern.regex.test(normalized)) {
//         return { brand: brand, mainTitle: pattern.result };
//       }
//     }

//     return { brand: brand, mainTitle: null };
//   }

//   /**
//    * Variant title extract karo (brand aur main title ko remove karke)
//    */
//   private extractVariantTitle(
//     fullTitle: string,
//     brand: string,
//     mainTitle: string,
//   ): string {
//     // const normalized = fullTitle.replace(/Macbook/gi, 'MacBook');
//     // const normalized = fullTitle.replace(/watch/gi, 'watch');
//     // const normalized = fullTitle.replace(/ipad/gi, 'Ipad');
//     // const normalized = fullTitle.replace(/IPhone/gi, 'iPhone');
//     const normalized = fullTitle.replace(/LEXAR/gi, 'Lexar');
//     let variant = normalized;

//     const prefixToRemove = `${brand} ${mainTitle}`;
//     if (variant.startsWith(prefixToRemove)) {
//       variant = variant.substring(prefixToRemove.length).trim();
//     } else if (variant.startsWith(mainTitle)) {
//       variant = variant.substring(mainTitle.length).trim();
//     }

//     return variant.trim();
//   }

//   /**
//    * Discount calculate karo old price aur new price se
//    */
//   private calculateDiscount(
//     oldPrice: string = '',
//     newPrice: string = '',
//   ): { price: number; discount: number } {
//     try {
//       // Price strings se numbers extract karo
//       const oldPriceNum = oldPrice
//         ? parseFloat(oldPrice.replace(/[^\d.]/g, ''))
//         : 0;
//       const newPriceNum = newPrice
//         ? parseFloat(newPrice.replace(/[^\d.]/g, ''))
//         : 0;

//       if (oldPriceNum > 0 && newPriceNum > 0 && newPriceNum < oldPriceNum) {
//         const discount = Math.round(
//           ((oldPriceNum - newPriceNum) / oldPriceNum) * 100,
//         );

//         return {
//           price: Math.floor(oldPriceNum), // base price = old price
//           discount,
//         };
//       }

//       if (newPriceNum > 0) {
//         return {
//           price: Math.floor(newPriceNum),
//           discount: 0,
//         };
//       }
//       return { price: 0, discount: 0 };
//     } catch {
//       return { price: 0, discount: 0 };
//     }
//   }

//   /**
//    * Slug generate karo variant title se
//    */
//   private generateSlug(text: string): string {
//     return text
//       .toLowerCase()
//       .replace(/[^a-z0-9\s-]/g, '')
//       .replace(/\s+/g, '-')
//       .replace(/-+/g, '-')
//       .replace(/^-|-$/g, '');
//   }

//   /**
//    * Flat format data ko transform karo (Document 1 type)
//    */
//   private transformFlatFormat(inputData: ProductInput[]): ProductGroup[] {
//     const groupedProducts: Record<string, ProductGroup> = {};

//     for (const product of inputData) {
//       const getBrand = (product as unknown as { specs: Record<string, any> })
//         .specs['brand'];
//       const { brand, mainTitle } = this.extractBrandAndTitle(
//         product.title,
//         getBrand,
//       );

//       if (!mainTitle) {
//         console.warn(`Could not extract main_title from: ${product.title}`);
//         continue;
//       }

//       const variantTitle = this.extractVariantTitle(
//         product.title,
//         brand,
//         mainTitle,
//       );
//       const { price, discount } = this.calculateDiscount(
//         product.oldPrice,
//         product.newPrice,
//       );
//       const slug = this.generateSlug(variantTitle);

//       const variant: ProductVariant = {
//         product_title: variantTitle,
//         slug,
//         description: product.description || '',
//         attributes: product.specs || {},
//         image: product.image || '',
//         price,
//         discount_off: discount,
//         seoContent: product?.seoContent || '',
//         faqContent: product?.faqContent || '',
//       };

//       // Group initialize karo agar pehli baar hai
//       if (!groupedProducts[mainTitle]) {
//         groupedProducts[mainTitle] = {
//           brand,
//           main_title: mainTitle,
//           variants: [],
//         };
//       }

//       // Variant add karo
//       groupedProducts[mainTitle].variants.push(variant);
//     }

//     return Object.values(groupedProducts);
//   }

//   /**
//    * Already grouped format ko process karo (Document 2 type)
//    */
//   private transformGroupedFormat(inputData: any[]): ProductGroup[] {
//     return inputData.map((group) => ({
//       brand: group.brand || 'Apple',
//       main_title: group.main_title || '',
//       variants: group.variants || [],
//     }));
//   }

//   /**
//    * Main transformation function - file path se data read karke transform karo
//    */
//   async transformProductData(filePath: string) {
//     try {
//       // File ko read karo
//       const fileContent = await fs.readFile(filePath, 'utf-8');
//       const jsonData = JSON.parse(fileContent);

//       let transformedData: ProductGroup[];

//       // Check karo data kis format mein hai
//       if (Array.isArray(jsonData)) {
//         // Agar pehla item mein 'title' field hai to flat format hai
//         if (jsonData.length > 0 && jsonData[0].title) {
//           transformedData = this.transformFlatFormat(jsonData);
//         }
//         // Agar pehla item mein 'main_title' aur 'variants' hai to grouped format hai
//         else if (
//           jsonData.length > 0 &&
//           jsonData[0].main_title &&
//           jsonData[0].variants
//         ) {
//           transformedData = this.transformGroupedFormat(jsonData);
//         } else {
//           throw new Error('Invalid data format!');
//         }
//       } else {
//         throw new Error('Data array format mein hona chahiye!');
//       }

//       // Output file path generate karo
//       const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//       const outputFileName = `transformed-products-${timestamp}.json`;
//       const outputFilePath = path.join(this.outputDir, outputFileName);

//       // Transformed data ko file mein save karo
//       await fs.writeFile(
//         outputFilePath,
//         JSON.stringify(transformedData, null, 2),
//         'utf-8',
//       );

//       // Temp file ko delete karo
//       await fs.unlink(filePath);

//       // Summary return karo
//       return {
//         totalProducts: transformedData.length,
//         outputFilePath,
//         productGroups: transformedData.map((g) => ({
//           brand: g.brand,
//           main_title: g.main_title,
//           variantCount: g.variants.length,
//         })),
//       };
//     } catch (error) {
//       throw new BadRequestException(
//         `Error transforming data: ${(error as unknown as { message: string }).message}`,
//       );
//     }
//   }

//   /**
//    * Direct request body se transform karo (testing ke liye)
//    */
//   transformFromRequest() {
//     // Yeh function baad mein implement kar sakte ho agar chahiye
//     return { message: 'Not implemented yet' };
//   }
// }

// =======================================MORE BRANDS================================================

/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ProductInput {
  title: string;
  description: string;
  image: string;
  oldPrice?: string;
  newPrice?: string;
  specs: Record<string, any>;
  seoContent?: string;
  faqContent?: string;
}

interface ProductVariant {
  product_title: string;
  slug: string;
  description: string;
  attributes: Record<string, any>;
  image: string;
  price: number;
  discount_off: number;
  seoContent: string;
  faqContent: string;
}

interface ProductGroup {
  brand: string;
  main_title: string;
  variants: ProductVariant[];
}

@Injectable()
export class ProductTransformService {
  private readonly outputDir = './uploads/transformed'; // Output folder path

  constructor() {
    // Output directory ko create karo agar exist nahi karti
    this.ensureDirectoryExists(this.outputDir);
  }

  /**
   * Directory ko check karo aur create karo agar exist nahi karti
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Brand extract karo specs se (dynamic)
   */
  private extractBrand(specs: Record<string, any>): string {
    // Specs mein se brand nikalo
    const brand = specs?.brand || specs?.Brand || specs?.BRAND || '';

    // Agar brand mil gaya to return karo
    if (brand) {
      return brand.trim();
    }

    // Default brand (agar specs mein nahi mila)
    return 'Unknown';
  }

  /**
   * Main title extract karo product title se (category/capacity)
   */
  private extractMainTitle(title: string): string | null {
    // Title ko normalize karo
    const normalized = title;

    // Different patterns check karo - category wise
    const patterns = [
      { regex: /TS EVO/i, result: 'TS EVO' }, // Samsung
      { regex: /T7/i, result: 'T7' }, // Samsung
      { regex: /T9/i, result: 'T9' }, // Samsung
      { regex: /PS8/i, result: 'PS8' }, // Lenovo
      { regex: /PS6/i, result: 'PS6' }, // Lenovo
      { regex: /Expansion/i, result: 'Expansion' }, // Seagate
      { regex: /Desire/i, result: 'Desire' }, // Hikvision
      { regex: /RED/i, result: 'RED' }, // WD
      { regex: /Blue/i, result: 'Blue' }, // WD
      { regex: /Green/i, result: 'Green' }, // WD
      { regex: /Ultrastar/i, result: 'Ultrastar' }, // WD
      { regex: /Legend/i, result: 'Legend' }, // Adata
      { regex: /Storejet/i, result: 'Storejet' }, // Transcend
      { regex: /SPATIUM/i, result: 'SPATIUM' }, // Msi
      { regex: /DiskStation/i, result: 'DiskStation' }, // Synology
      { regex: /Enclosure/i, result: 'Enclosure' }, // QNAP
      { regex: /Elite/i, result: 'Elite' }, // Corsair
      { regex: /S500/i, result: 'S500' }, // Aigo
      { regex: /Pocket/i, result: 'Pocket' }, // Hiksemi
      { regex: /E61/i, result: 'E61' }, // Sandisk
      { regex: /E30/i, result: 'E30' }, // Sandisk
      // generics
      { regex: /22TB 3\.5/i, result: '22TB 3.5' }, // WD
      { regex: /18TB 3\.5/i, result: '18TB 3.5' }, // WD
      { regex: /14TB 3\.5/i, result: '14TB 3.5' }, // WD
      { regex: /12TB 3\.5/i, result: '12TB 3.5' }, // WD
      { regex: /10TB 3\.5/i, result: '10TB 3.5' }, // Seagate
      { regex: /8TB 3\.5/i, result: '8TB 3.5' }, // Seagate
      { regex: /6TB 3\.5/i, result: '6TB 3.5' }, // Seagate
      { regex: /4TB 3\.5/i, result: '4TB 3.5' }, // Seagate
      { regex: /2TB 3\.5/i, result: '2TB 3.5' }, // WD
      { regex: /1TB 3\.5/i, result: '1TB 3.5' }, // WD
      // specs
      { regex: /16TB/i, result: '16TB' }, // Seagate
      { regex: /14TB/i, result: '14TB' }, // Seagate
      { regex: /12TB/i, result: '12TB' }, // Seagate
      { regex: /4TB/i, result: '4TB' }, // Samsung
      { regex: /2TB/i, result: '2TB' }, // Samsung
      { regex: /1TB/i, result: '1TB' }, // Samsung
      { regex: /512GB/i, result: '512GB' }, // Lexar
      { regex: /500GB/i, result: '500GB' }, // Kingston
      { regex: /256GB/i, result: '256GB' }, // Lexar
      { regex: /250GB/i, result: '250GB' }, // Samsung
      { regex: /128GB/i, result: '128GB' }, // Lexar
      { regex: /64GB/i, result: '64GB' }, // Kingston
      { regex: /32GB/i, result: '32GB' }, // Sandisk
      // normal
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(normalized)) {
        return pattern.result;
      }
    }

    return null;
  }

  /**
   * Variant title extract karo (brand aur main title ko remove karke)
   */
  private extractVariantTitle(
    fullTitle: string,
    brand: string,
    mainTitle: string,
  ): string {
    const normalized = fullTitle;
    let variant = normalized;

    // Brand aur main title ko remove karo
    const prefixToRemove = `${brand} ${mainTitle}`;
    if (variant.startsWith(prefixToRemove)) {
      variant = variant.substring(prefixToRemove.length).trim();
    } else if (variant.startsWith(mainTitle)) {
      variant = variant.substring(mainTitle.length).trim();
    } else if (variant.startsWith(brand)) {
      variant = variant.substring(brand.length).trim();
    }

    return variant.trim();
  }

  /**
   * Discount calculate karo old price aur new price se
   */
  private calculateDiscount(
    oldPrice: string = '',
    newPrice: string = '',
  ): { price: number; discount: number } {
    try {
      // Price strings se numbers extract karo
      const oldPriceNum = oldPrice
        ? parseFloat(oldPrice.replace(/[^\d.]/g, ''))
        : 0;
      const newPriceNum = newPrice
        ? parseFloat(newPrice.replace(/[^\d.]/g, ''))
        : 0;

      if (oldPriceNum > 0 && newPriceNum > 0 && newPriceNum < oldPriceNum) {
        const discount = Math.round(
          ((oldPriceNum - newPriceNum) / oldPriceNum) * 100,
        );

        return {
          price: Math.floor(oldPriceNum), // base price = old price
          discount,
        };
      }

      if (newPriceNum > 0) {
        return {
          price: Math.floor(newPriceNum),
          discount: 0,
        };
      }
      return { price: 0, discount: 0 };
    } catch {
      return { price: 0, discount: 0 };
    }
  }

  /**
   * Slug generate karo variant title se
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Flat format data ko transform karo (Document 1 type)
   * Ab brand + main_title ke combination se group hoga
   */
  private transformFlatFormat(inputData: ProductInput[]): ProductGroup[] {
    const groupedProducts: Record<string, ProductGroup> = {};

    for (const product of inputData) {
      // Brand specs se extract karo
      const brand = this.extractBrand(product.specs);

      // Main title extract karo
      const mainTitle = this.extractMainTitle(product.title);

      if (!mainTitle) {
        console.warn(`Could not extract main_title from: ${product.title}`);
        continue;
      }

      // Unique key banao: brand + main_title
      // Example: "Samsung-2TB", "WD-2TB", "Seagate-2TB"
      const groupKey = `${brand}-${mainTitle}`;

      const variantTitle = this.extractVariantTitle(
        product.title,
        brand,
        mainTitle,
      );
      const { price, discount } = this.calculateDiscount(
        product.oldPrice,
        product.newPrice,
      );
      const slug = this.generateSlug(variantTitle);

      const variant: ProductVariant = {
        product_title: variantTitle,
        slug,
        description: product.description || '',
        attributes: product.specs || {},
        image: product.image || '',
        price,
        discount_off: discount,
        seoContent: product?.seoContent || '',
        faqContent: product?.faqContent || '',
      };

      // Group initialize karo agar pehli baar hai
      if (!groupedProducts[groupKey]) {
        groupedProducts[groupKey] = {
          brand,
          main_title: mainTitle,
          variants: [],
        };
      }

      // Variant add karo
      groupedProducts[groupKey].variants.push(variant);
    }

    return Object.values(groupedProducts);
  }

  /**
   * Already grouped format ko process karo (Document 2 type)
   */
  private transformGroupedFormat(inputData: any[]): ProductGroup[] {
    return inputData.map((group) => ({
      brand: group.brand || 'Unknown',
      main_title: group.main_title || '',
      variants: group.variants || [],
    }));
  }

  /**
   * Main transformation function - file path se data read karke transform karo
   */
  async transformProductData(filePath: string) {
    try {
      // File ko read karo
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);

      let transformedData: ProductGroup[];

      // Check karo data kis format mein hai
      if (Array.isArray(jsonData)) {
        // Agar pehla item mein 'title' field hai to flat format hai
        if (jsonData.length > 0 && jsonData[0].title) {
          transformedData = this.transformFlatFormat(jsonData);
        }
        // Agar pehla item mein 'main_title' aur 'variants' hai to grouped format hai
        else if (
          jsonData.length > 0 &&
          jsonData[0].main_title &&
          jsonData[0].variants
        ) {
          transformedData = this.transformGroupedFormat(jsonData);
        } else {
          throw new Error('Invalid data format!');
        }
      } else {
        throw new Error('Data array format mein hona chahiye!');
      }

      // Output file path generate karo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFileName = `transformed-products-${timestamp}.json`;
      const outputFilePath = path.join(this.outputDir, outputFileName);

      // Transformed data ko file mein save karo
      await fs.writeFile(
        outputFilePath,
        JSON.stringify(transformedData, null, 2),
        'utf-8',
      );

      // Temp file ko delete karo
      await fs.unlink(filePath);

      // Summary return karo
      return {
        totalProducts: transformedData.length,
        outputFilePath,
        productGroups: transformedData.map((g) => ({
          brand: g.brand,
          main_title: g.main_title,
          variantCount: g.variants.length,
        })),
      };
    } catch (error) {
      throw new BadRequestException(
        `Error transforming data: ${(error as unknown as { message: string }).message}`,
      );
    }
  }

  /**
   * Direct request body se transform karo (testing ke liye)
   */
  transformFromRequest() {
    // Yeh function baad mein implement kar sakte ho agar chahiye
    return { message: 'Not implemented yet' };
  }
}
