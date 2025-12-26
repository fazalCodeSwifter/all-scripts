/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { Injectable } from '@nestjs/common';
import * as Papa from 'papaparse';
import * as fs from 'fs';

interface ParsedProduct {
  id: number;
  brand: string;
  main_title: string;
  category?: string;
  sub_category?: string;
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
export class ParseService {
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
    let productIdCounter = 1;

    rows.forEach((row) => {
      // Brand aur Main Title mandatory hain
      const brand = row['Brand']?.trim();
      const mainTitle = row['Main Title']?.trim();

      if (!brand || !mainTitle) {
        console.warn('Skipping row - Brand or Main Title missing:', row);
        return;
      }

      // Unique key for grouping
      const productKey = `${brand}___${mainTitle}`;

      // Agar product pehle se exist nahi karta to create karo
      if (!productsMap.has(productKey)) {
        productsMap.set(productKey, {
          id: productIdCounter++,
          brand: brand,
          main_title: mainTitle,
          category: row['Category']?.trim() || undefined,
          sub_category: row['Sub Category']?.trim() || undefined,
          variants: [],
        });
      }

      // Variant create karo
      const variant = this.createVariant(row);
      productsMap.get(productKey)!.variants.push(variant);
    });

    return Array.from(productsMap.values());
  }

  /**
   * Single row se variant object banata hai
   */
  private createVariant(row: any): ProductVariant {
    const productTitle = row['Variants/Product title']?.trim() || '';

    // Dynamic attributes extract karo
    const attributes = this.extractAttributes(row);

    // Price ko properly parse karo (commas remove karke)
    const priceStr = row['variants/price']?.toString().replace(/,/g, '') || '0';
    const price = parseFloat(priceStr) || 0;

    const discountStr = row['variants/discount off']?.toString() || '0';
    const discountOff = parseFloat(discountStr) || 0;

    return {
      product_title: productTitle,
      slug: this.generateSlug(productTitle),
      description: row['Variants/Description']?.trim() || '',
      attributes: attributes,
      image: row['variants/image']?.trim() || '',
      price: price,
      discount_off: discountOff,
    };
  }

  /**
   * Row se dynamically attributes extract karta hai
   * Sirf "variants/attributes/" prefix wale columns ko extract karega
   */
  private extractAttributes(row: any): Record<string, any> {
    const attributes: Record<string, any> = {};

    Object.keys(row).forEach((key) => {
      // Check if column is an attribute
      if (key.toLowerCase().includes('variants/attributes/')) {
        // Extract attribute name (e.g., "variants/attributes/Ram" -> "ram")
        const attributeName = key
          .replace(/variants\/attributes\//gi, '')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_');

        const value = row[key]?.toString().trim();

        // Only add if value exists
        if (value && value !== '') {
          attributes[attributeName] = value;
        }
      }
    });

    return attributes;
  }

  /**
   * Text se SEO-friendly slug generate karta hai
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Special characters remove
      .replace(/\s+/g, '-') // Spaces ko dashes se replace
      .replace(/-+/g, '-') // Multiple dashes ko single dash
      .replace(/^-+|-+$/g, ''); // Start/end ke dashes remove
  }

  /**
   * Products ko JSON file mein save karta hai
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async saveToJsonFile(
    products: ParsedProduct[],
    outputPath: string,
  ): Promise<void> {
    const jsonData = JSON.stringify(products, null, 2);
    fs.writeFileSync(outputPath, jsonData, 'utf-8');
    console.log(`✓ Products saved to ${outputPath}`);
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
}
