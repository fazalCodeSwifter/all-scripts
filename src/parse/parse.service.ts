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

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ParsedProduct {
  brand: string;
  main_title: string;
  variants: ProductVariant[];
}

interface ProductVariant {
  product_title: string;
  slug: string;
  description: string;
  seoContent: string;
  faqContent: string;
  attributes: Record<string, any>;
  image: string[];       // comma separated images → array
  price: number;         // selling price (as is from CSV)
  original_price: number; // price + discount_amount
  discount_off: number;  // percent mein (calculated)
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class ParseService {

  // ─── Public: CSV parse karke products return karo ──────────────────────────
  async parseCsvToProducts(filePath: string): Promise<ParsedProduct[]> {
    const csvData = fs.readFileSync(filePath, 'utf-8');

    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const products = this.processRows(results.data as any[]);
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

  // ─── Public: JSON file mein save karo ──────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/require-await
  async saveToJsonFile(products: ParsedProduct[], outputPath: string): Promise<void> {
    const jsonData = JSON.stringify(products, null, 2);
    fs.writeFileSync(outputPath, jsonData, 'utf-8');
    console.log(`✓ JSON saved to ${outputPath}`);
  }

  // ─── Public: Stats generate karo ───────────────────────────────────────────
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

  // ─── Private: Rows ko products mein convert karo ───────────────────────────
  private processRows(rows: any[]): ParsedProduct[] {
    const productsMap = new Map<string, ParsedProduct>();

    rows.forEach((row) => {
      // Brand aur Main Title mandatory hain
      const brand = row['Brand']?.trim() || row['brand']?.trim();
      const mainTitle = row['Main Title']?.trim();

      if (!brand || !mainTitle) {
        console.warn('Skipping row — Brand or Main Title missing:', row);
        return;
      }

      // Unique key for grouping (same brand + main title = ek product)
      const productKey = `${brand}___${mainTitle}`;

      if (!productsMap.has(productKey)) {
        productsMap.set(productKey, {
          brand,
          main_title: mainTitle,
          category: row['Category']?.trim() || undefined,
          sub_category: row['Sub Category']?.trim() || undefined,
          variants: [],
        });
      }

      const variant = this.createVariant(row);
      productsMap.get(productKey)!.variants.push(variant);
    });

    return Array.from(productsMap.values());
  }

  // ─── Private: Single row se variant banao ──────────────────────────────────
  private createVariant(row: any): ProductVariant {
    const productTitle = row['Variants/Product title']?.trim() || '';

    // ── Price: selling price (already discounted, as is) ──────────────────────
    const priceStr = row['variants/price']?.toString().replace(/,/g, '') || '0';
    const sellingPrice = parseFloat(priceStr) || 0;

    // ── Discount: CSV mein rupees mein hai ────────────────────────────────────
    const discountStr = row['variants/discount off']?.toString().replace(/,/g, '') || '0';
    const discountAmount = parseFloat(discountStr) || 0;

    // ── Original price & percent calculate karo ───────────────────────────────
    // original = selling + discount_amount
    // percent  = (discount_amount / original) * 100
    const originalPrice = sellingPrice + discountAmount;
    const discountPercent =
      originalPrice > 0
        ? Math.round((discountAmount / originalPrice) * 100)
        : 0;

    // ── Images: comma separated string → clean array ──────────────────────────
    const imageRaw = row['variants/image']?.trim() || '';
    const images: string[] = imageRaw
      .split(',')
      .map((url: string) => url.trim())
      .filter((url: string) => url !== '');

    // ── Dynamic attributes extract karo ───────────────────────────────────────
    const attributes = this.extractAttributes(row);

    return {
      product_title: productTitle,
      slug: this.generateSlug(productTitle),
      description: row['Variants/Description']?.trim() || '',
      seoContent: row['variants/seoContent']?.trim() || '',
      faqContent: row['variants/faqContent']?.trim() || '',
      attributes,
      image: images,
      price: sellingPrice,           // final price — as is from CSV
      original_price: originalPrice, // price + discount amount
      discount_off: discountPercent, // % mein (calculated)
    };
  }

  // ─── Private: Dynamic attributes extract karo ──────────────────────────────
  // Sirf "variants/attributes/" prefix wale columns pick karega
  private extractAttributes(row: any): Record<string, any> {
    const attributes: Record<string, any> = {};

    Object.keys(row).forEach((key) => {
      if (key.toLowerCase().includes('variants/attributes/')) {
        // "variants/attributes/Ram" → "ram"
        const attributeName = key
          .replace(/variants\/attributes\//gi, '')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_');

        const value = row[key]?.toString().trim();

        if (value && value !== '') {
          attributes[attributeName] = value;
        }
      }
    });

    return attributes;
  }

  // ─── Private: SEO friendly slug generate karo ──────────────────────────────
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')  // special chars remove
      .replace(/\s+/g, '-')           // spaces → dashes
      .replace(/-+/g, '-')            // multiple dashes → single
      .replace(/^-+|-+$/g, '');       // start/end dashes remove
  }
}