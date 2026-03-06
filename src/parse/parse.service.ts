/* eslint-disable prettier/prettier */
// -------------------------- DYSON -----------------------------------------------
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
  seo_content: string;
  faq_content: string;
  attributes: Record<string, any>;
  images: string[]; // Array of images
  price: number;
  discount_off: number; // Percentage
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

    rows.forEach((row) => {
      // Brand aur Main Title extract karo
      const brand = row['Brand']?.trim() || 'Unknown';
      const mainTitle = row['Main Title']?.trim() || 'Unknown Product';

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
    const description = row['Variants/Description']?.trim() || '';

    // SEO Content and FAQ Content (new fields)
    const seoContent = row['variants/seoContent']?.trim() || '';
    const faqContent = row['variants/faqContent']?.trim() || '';

    // Images array - comma separated se split karo
    const imagesStr = row['variants/image']?.trim() || '';
    const images = imagesStr
      .split(',')
      .map((img: string) => img.trim())
      .filter((img: string) => img !== '');

    // Price aur Discount calculation
    const finalPrice = this.convertNumber(row['variants/price']);
    const discountAmount = this.convertNumber(row['variants/discount off']);

    // Original price calculate karo
    const originalPrice = finalPrice + discountAmount;

    // Discount percentage calculate karo
    let discountPercentage = 0;
    if (originalPrice > 0 && discountAmount > 0) {
      discountPercentage = Math.round((discountAmount / originalPrice) * 100);
    }

    // Attributes dynamically collect karo
    const attributes: Record<string, any> = {};

    Object.keys(row).forEach((key) => {
      // Skip main fields
      if (
        key === 'Brand' ||
        key === 'Main Title' ||
        key === 'Variants/Product title' ||
        key === 'Variants/Description' ||
        key === 'variants/image' ||
        key === 'variants/price' ||
        key === 'variants/discount off' ||
        key === 'variants/seoContent' ||
        key === 'variants/faqContent'
      ) {
        return;
      }

      // Extract attributes
      if (key.startsWith('variants/attributes/')) {
        const attrName = key.replace('variants/attributes/', '');
        const value = row[key]?.toString().trim();

        if (value && value !== '' && value !== 'undefined' && value !== 'null') {
          attributes[attrName] = value;
        }
      }
    });

    return {
      product_title: productTitle,
      slug: this.slugify(productTitle),
      description: description,
      seo_content: seoContent,
      faq_content: faqContent,
      attributes: attributes,
      images: images,
      price: finalPrice,
      discount_off: discountPercentage, // Percentage form mein
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

        // Images array ko comma-separated string mein convert
        const imagesStr = variant.images.join(', ');

        output.push({
          Brand: product.brand,
          'Main Title': product.main_title,
          'Variants/Product title': variant.product_title,
          'Variants/Description': variant.description,
          'variants/seoContent': variant.seo_content,
          'variants/faqContent': variant.faq_content,
          'variants/image': imagesStr,
          'variants/price': variant.price,
          'variants/discount off': variant.discount_off, // Percentage
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
    const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0);
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

    // Remove commas and convert to number
    const cleanValue = value.toString().replace(/,/g, '');
    return Number(cleanValue) || 0;
  }

  private slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}