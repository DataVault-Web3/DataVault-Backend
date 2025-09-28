#!/usr/bin/env ts-node

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient, WalrusFile } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import * as crypto from 'crypto';

/**
 * Script to store random data into Walrus following the same pattern as API calls:
 * 1. Store user data in quilts
 * 2. Create consolidated blob containing quilt IDs
 * 3. Print the final blob CID
 */

class RandomDataStorageScript {
  private walrusClient: WalrusClient;
  private suiClient: SuiClient;
  private keypair: Ed25519Keypair;

  constructor() {
    // Initialize Sui client for testnet
    this.suiClient = new SuiClient({
      url: getFullnodeUrl('testnet'),
    });

    // Initialize Walrus client for testnet
    this.walrusClient = new WalrusClient({
      network: 'testnet',
      suiClient: this.suiClient,
    });

    // Generate a keypair for signing transactions
    const privateKey = process.env.WALRUS_PVT_KEY;
    if (!privateKey) {
      throw new Error('WALRUS_PVT_KEY environment variable is required');
    }
    this.keypair = Ed25519Keypair.fromSecretKey(privateKey);

    console.log('✅ WalrusService initialized with testnet configuration');
  }

  /**
   * Generate random user data similar to what would be stored via API
   */
  private generateRandomUserData(count: number = 5): any[] {
    const userDataArray = [];

    for (let i = 0; i < count; i++) {
      const userData = [
        {
          "itemName": "Amazon Pay Wallet",
          "amazonLink": "https://amazon.in/dp/B01LTHND2O?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-08-09",
          "returnStatus": "Not returned",
          "id": "QW1hem9uIFBheSBX",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Amazon Pay Wallet",
          "amazonLink": "https://amazon.in/dp/B01LTHND2O?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-09-01",
          "returnStatus": "Not returned",
          "id": "QW1hem9uIFBheSBX",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "5Pcs Phone Charms, Cute Cat Bag Charms for Handbags, Anime Accessories Phone Charm with Cat Chain, Mobile Charms for Phone Case and Bag Decoration",
          "amazonLink": "https://amazon.in/dp/B0FL1WWQR7?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-09-15",
          "returnStatus": "Not returned",
          "id": "NVBjcyBQaG9uZSBD",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "JCGI®️ Handmade Crochet Sunflower Keychain Decorative Cute Bag Purse Keyrings Charm Love Stylish Lightweight Motorbike Car Unique Personalized Keychain Girlfriend Sister Gift Travel Accessories",
          "amazonLink": "https://amazon.in/dp/B0DG27GFDJ?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-08-22",
          "returnStatus": "Not returned",
          "id": "SkNHScKuIEhhbmRt",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "5Pcs Phone Charms, Cute Cat Bag Charms for Handbags, Anime Accessories Phone Charm with Cat Chain, Mobile Charms for Phone Case and Bag Decoration",
          "amazonLink": "https://amazon.in/dp/B0FL1WWQR7?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-09-17",
          "returnStatus": "Not returned",
          "id": "NVBjcyBQaG9uZSBD",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "JCGI®️ Handmade Crochet Sunflower Keychain Decorative Cute Bag Purse Keyrings Charm Love Stylish Lightweight Motorbike Car Unique Personalized Keychain Girlfriend Sister Gift Travel Accessories",
          "amazonLink": "https://amazon.in/dp/B0DG27GFDJ?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-08-16",
          "returnStatus": "Not returned",
          "id": "SkNHScKuIEhhbmRt",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Bata Women's Slip-on Sandal - BEIGE (5 UK) (5618803)",
          "amazonLink": "https://amazon.in/dp/B095X47QVR?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-09-09",
          "returnStatus": "Not returned",
          "id": "QmF0YSBXb21lbidz",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Bata Women's Slip-on Sandal - BEIGE (5 UK) (5618803)",
          "amazonLink": "https://amazon.in/dp/B095X47QVR?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-07-09",
          "returnStatus": "Not returned",
          "id": "QmF0YSBXb21lbidz",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Vaseline Lip Tins Rosy Lips, 17 g | Provides Hydration, Sheer Pink Tint & Glossy Shine",
          "amazonLink": "https://amazon.in/dp/B09J8RBPPZ?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-09-25",
          "returnStatus": "Not returned",
          "id": "VmFzZWxpbmUgTGlw",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "SPHINX Decorative Glass Vase for Flowers Plants Home Decor Office Living Table Decorations, Vases for Home Decor, Luster Glass Vase, Heavy Weight, Sturdy- (Crystal Amber, Approx 9 Inches Height)",
          "amazonLink": "https://amazon.in/dp/B0CSWJ39V4?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-09-22",
          "returnStatus": "Not returned",
          "id": "U1BISU5YIERlY29y",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "ZAVERI PEARLS Multi For Women-Color Silver Artificial Stones Embellished Kada Bracelets For Women-ZPFK16889",
          "amazonLink": "https://amazon.in/dp/B0CM9KV4YX?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-07-31",
          "returnStatus": "Not returned",
          "id": "WkFWRVJJIFBFQVJM",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Vaseline Lip Tins Rosy Lips, 17 g | Provides Hydration, Sheer Pink Tint & Glossy Shine",
          "amazonLink": "https://amazon.in/dp/B09J8RBPPZ?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-07-11",
          "returnStatus": "Not returned",
          "id": "VmFzZWxpbmUgTGlw",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "SPHINX Decorative Glass Vase for Flowers Plants Home Decor Office Living Table Decorations, Vases for Home Decor, Luster Glass Vase, Heavy Weight, Sturdy- (Crystal Amber, Approx 9 Inches Height)",
          "amazonLink": "https://amazon.in/dp/B0CSWJ39V4?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-08-02",
          "returnStatus": "Not returned",
          "id": "U1BISU5YIERlY29y",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "ZAVERI PEARLS Multi For Women-Color Silver Artificial Stones Embellished Kada Bracelets For Women-ZPFK16889",
          "amazonLink": "https://amazon.in/dp/B0CM9KV4YX?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-09-11",
          "returnStatus": "Not returned",
          "id": "WkFWRVJJIFBFQVJM",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Happer Premium Clothes Stand for Drying with Wheels | Portable | 2 Layer Rack for Balcony | Foldable Wings | 14 Hanger Rods | Anti Rust Steel Metal (Orange | Compact Jumbo)",
          "amazonLink": "https://amazon.in/dp/B08242S175?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-08-10",
          "returnStatus": "Not returned",
          "id": "SGFwcGVyIFByZW1p",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Happer Premium Clothes Stand for Drying with Wheels | Portable | 2 Layer Rack for Balcony | Foldable Wings | 14 Hanger Rods | Anti Rust Steel Metal (Orange | Compact Jumbo)",
          "amazonLink": "https://amazon.in/dp/B08242S175?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-08-07",
          "returnStatus": "Not returned",
          "id": "SGFwcGVyIFByZW1p",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Zureni Heavy Duty Clothes Pins Multipurpose Tight Grip Laundry Clips with Springs Air-Drying Clothing Pin Set for Balcony & Outdoor Use- (Pack of 12, Random Color)",
          "amazonLink": "https://amazon.in/dp/B0C6KJCBLY?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-07-28",
          "returnStatus": "Not returned",
          "id": "WnVyZW5pIEhlYXZ5",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Zureni Heavy Duty Clothes Pins Multipurpose Tight Grip Laundry Clips with Springs Air-Drying Clothing Pin Set for Balcony & Outdoor Use- (Pack of 12, Random Color)",
          "amazonLink": "https://amazon.in/dp/B0C6KJCBLY?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-08-28",
          "returnStatus": "Not returned",
          "id": "WnVyZW5pIEhlYXZ5",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "View order details",
          "amazonLink": "https://www.amazon.in/pay/transaction-details?marketplaceId=A21TJRUUN4KGV&ingress=WALLET_ORDER_HISTORY&orderDetails=%7B%22asinListString%22%3A%22B01LTHND2O%22%2C%22isItemDetailEligible%22%3A%22true%22%7D&idempotencyId=amzn1.pcx.PaymentContract.1.0.PaymentContractDefinition.1.0.AQ.BQ.AAABmU4x5pU.q1_HBz_Xw-fGAMlPLKcTgQ&useCase=wallet_add_money&ref=ppx_yo2ov_dt_b_fed_apay_load_odc&orderId=406-5929467-2599565",
          "price": "",
          "dateOrdered": "2025-04-26",
          "returnStatus": "Not returned",
          "id": "VmlldyBvcmRlciBk",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Amazon Pay Wallet",
          "amazonLink": "https://www.amazon.in/dp/B01LTHND2O?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-05-15",
          "returnStatus": "Not returned",
          "id": "QW1hem9uIFBheSBX",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "View order details",
          "amazonLink": "https://www.amazon.in/gp/css/order-details?orderID=406-9086285-5753929&ref=ppx_yo2ov_dt_b_fed_order_details",
          "price": "",
          "dateOrdered": "2025-07-03",
          "returnStatus": "Not returned",
          "id": "VmlldyBvcmRlciBk",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "5Pcs Phone Charms, Cute Cat Bag Charms for Handbags, Anime Accessories Phone Charm with Cat Chain, Mobile Charms for Phone Case and Bag Decoration",
          "amazonLink": "https://www.amazon.in/dp/B0FL1WWQR7?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-04-07",
          "returnStatus": "Not returned",
          "id": "NVBjcyBQaG9uZSBD",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "JCGI®️ Handmade Crochet Sunflower Keychain Decorative Cute Bag Purse Keyrings Charm Love Stylish Lightweight Motorbike Car Unique Personalized Keychain Girlfriend Sister Gift Travel Accessories",
          "amazonLink": "https://www.amazon.in/dp/B0DG27GFDJ?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-05-02",
          "returnStatus": "Not returned",
          "id": "SkNHScKuIEhhbmRt",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "View order details",
          "amazonLink": "https://www.amazon.in/gp/css/order-details?orderID=406-7011399-5710728&ref=ppx_yo2ov_dt_b_fed_order_details",
          "price": "",
          "dateOrdered": "2025-09-08",
          "returnStatus": "Not returned",
          "id": "VmlldyBvcmRlciBk",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Bata Women's Slip-on Sandal - BEIGE (5 UK) (5618803)",
          "amazonLink": "https://www.amazon.in/dp/B095X47QVR?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-05-24",
          "returnStatus": "Not returned",
          "id": "QmF0YSBXb21lbidz",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "View order details",
          "amazonLink": "https://www.amazon.in/gp/css/order-details?orderID=406-0520305-9940339&ref=ppx_yo2ov_dt_b_fed_order_details",
          "price": "",
          "dateOrdered": "2025-06-07",
          "returnStatus": "Not returned",
          "id": "VmlldyBvcmRlciBk",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Vaseline Lip Tins Rosy Lips, 17 g | Provides Hydration, Sheer Pink Tint & Glossy Shine",
          "amazonLink": "https://www.amazon.in/dp/B09J8RBPPZ?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-09-07",
          "returnStatus": "Not returned",
          "id": "VmFzZWxpbmUgTGlw",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "SPHINX Decorative Glass Vase for Flowers Plants Home Decor Office Living Table Decorations, Vases for Home Decor, Luster Glass Vase, Heavy Weight, Sturdy- (Crystal Amber, Approx 9 Inches Height)",
          "amazonLink": "https://www.amazon.in/dp/B0CSWJ39V4?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-04-15",
          "returnStatus": "Not returned",
          "id": "U1BISU5YIERlY29y",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Learn more about refund.",
          "amazonLink": "https://www.amazon.in/gp/help/customer/display.html?nodeId=GNW5VKFXMF72FFMR&ref=ppx_yo2ov_dt_b_return_help",
          "price": "",
          "dateOrdered": "2025-04-10",
          "returnStatus": "Not returned",
          "id": "TGVhcm4gbW9yZSBh",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "ZAVERI PEARLS Multi For Women-Color Silver Artificial Stones Embellished Kada Bracelets For Women-ZPFK16889",
          "amazonLink": "https://www.amazon.in/dp/B0CM9KV4YX?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-09-20",
          "returnStatus": "Not returned",
          "id": "WkFWRVJJIFBFQVJM",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "View order details",
          "amazonLink": "https://www.amazon.in/gp/css/order-details?orderID=406-9561806-6585118&ref=ppx_yo2ov_dt_b_fed_order_details",
          "price": "",
          "dateOrdered": "2025-09-16",
          "returnStatus": "Not returned",
          "id": "VmlldyBvcmRlciBk",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Happer Premium Clothes Stand for Drying with Wheels | Portable | 2 Layer Rack for Balcony | Foldable Wings | 14 Hanger Rods | Anti Rust Steel Metal (Orange | Compact Jumbo)",
          "amazonLink": "https://www.amazon.in/dp/B08242S175?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-06-25",
          "returnStatus": "Not returned",
          "id": "SGFwcGVyIFByZW1p",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "View order details",
          "amazonLink": "https://www.amazon.in/gp/css/order-details?orderID=406-5517068-1694718&ref=ppx_yo2ov_dt_b_fed_order_details",
          "price": "",
          "dateOrdered": "2025-07-13",
          "returnStatus": "Not returned",
          "id": "VmlldyBvcmRlciBk",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "Zureni Heavy Duty Clothes Pins Multipurpose Tight Grip Laundry Clips with Springs Air-Drying Clothing Pin Set for Balcony & Outdoor Use- (Pack of 12, Random Color)",
          "amazonLink": "https://www.amazon.in/dp/B0C6KJCBLY?ref=ppx_yo2ov_dt_b_fed_asin_title",
          "price": "",
          "dateOrdered": "2025-04-24",
          "returnStatus": "Not returned",
          "id": "WnVyZW5pIEhlYXZ5",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "View order details",
          "amazonLink": "https://www.amazon.in/uff/your-account/order-details?orderID=406-1487752-7977155&ref=ppx_yo2ov_dt_b_fed_wwgs_yo_odp_A21TJRUUN4KGV",
          "price": "",
          "dateOrdered": "2025-08-11",
          "returnStatus": "Not returned",
          "id": "VmlldyBvcmRlciBk",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "View order details",
          "amazonLink": "https://www.amazon.in/uff/your-account/order-details?orderID=406-0748329-0741907&ref=ppx_yo2ov_dt_b_fed_wwgs_yo_odp_A21TJRUUN4KGV",
          "price": "",
          "dateOrdered": "2025-04-03",
          "returnStatus": "Not returned",
          "id": "VmlldyBvcmRlciBk",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "M.R.P: ₹199.00",
          "amazonLink": "https://www.amazon.in/gp/buyagain/ref=pd_yo_rr_rp_d_sccl_1_1/521-4849824-1748850?pd_rd_w=V4CXP&content-id=amzn1.sym.dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_p=dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_r=YKH56CBQMTKBTCZ6Y0W1&pd_rd_wg=eePsh&pd_rd_r=c88ff08f-9534-45b9-a1f7-baec5e302a83&pd_rd_i=B0CG9JV4BG&ats=eyJleHBsaWNpdENhbmRpZGF0ZXMiOiJCMENHOUpWNEJHIiwiYXNpbkludGVyYWN0ZWQiOiJ0cnVlIiwiY3VzdG9tZXJJZCI6IkExOVJGMUNOTDFDSEoyIn0=",
          "price": "",
          "dateOrdered": "2025-07-20",
          "returnStatus": "Not returned",
          "id": "TS5SLlA64oCJ4oK5",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "M.R.P: ₹399.00",
          "amazonLink": "https://www.amazon.in/gp/buyagain/ref=pd_yo_rr_rp_d_sccl_1_2/521-4849824-1748850?pd_rd_w=V4CXP&content-id=amzn1.sym.dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_p=dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_r=YKH56CBQMTKBTCZ6Y0W1&pd_rd_wg=eePsh&pd_rd_r=c88ff08f-9534-45b9-a1f7-baec5e302a83&pd_rd_i=B0BWF3W8G1&ats=eyJleHBsaWNpdENhbmRpZGF0ZXMiOiJCMEJXRjNXOEcxIiwiYXNpbkludGVyYWN0ZWQiOiJ0cnVlIiwiY3VzdG9tZXJJZCI6IkExOVJGMUNOTDFDSEoyIn0=",
          "price": "",
          "dateOrdered": "2025-05-16",
          "returnStatus": "Not returned",
          "id": "TS5SLlA64oCJ4oK5",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "M.R.P: ₹249.00",
          "amazonLink": "https://www.amazon.in/gp/buyagain/ref=pd_yo_rr_rp_d_sccl_1_3/521-4849824-1748850?pd_rd_w=V4CXP&content-id=amzn1.sym.dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_p=dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_r=YKH56CBQMTKBTCZ6Y0W1&pd_rd_wg=eePsh&pd_rd_r=c88ff08f-9534-45b9-a1f7-baec5e302a83&pd_rd_i=B09J8RBPPZ&ats=eyJleHBsaWNpdENhbmRpZGF0ZXMiOiJCMDlKOFJCUFBaIiwiYXNpbkludGVyYWN0ZWQiOiJ0cnVlIiwiY3VzdG9tZXJJZCI6IkExOVJGMUNOTDFDSEoyIn0=",
          "price": "",
          "dateOrdered": "2025-07-13",
          "returnStatus": "Not returned",
          "id": "TS5SLlA64oCJ4oK5",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "M.R.P: ₹799.00",
          "amazonLink": "https://www.amazon.in/gp/buyagain/ref=pd_yo_rr_rp_d_sccl_1_4/521-4849824-1748850?pd_rd_w=V4CXP&content-id=amzn1.sym.dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_p=dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_r=YKH56CBQMTKBTCZ6Y0W1&pd_rd_wg=eePsh&pd_rd_r=c88ff08f-9534-45b9-a1f7-baec5e302a83&pd_rd_i=B0DLDFSD9N&ats=eyJleHBsaWNpdENhbmRpZGF0ZXMiOiJCMERMREZTRDlOIiwiYXNpbkludGVyYWN0ZWQiOiJ0cnVlIiwiY3VzdG9tZXJJZCI6IkExOVJGMUNOTDFDSEoyIn0=",
          "price": "",
          "dateOrdered": "2025-04-10",
          "returnStatus": "Not returned",
          "id": "TS5SLlA64oCJ4oK5",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "M.R.P: ₹120.00",
          "amazonLink": "https://www.amazon.in/gp/buyagain/ref=pd_yo_rr_rp_d_sccl_1_5/521-4849824-1748850?pd_rd_w=V4CXP&content-id=amzn1.sym.dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_p=dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_r=YKH56CBQMTKBTCZ6Y0W1&pd_rd_wg=eePsh&pd_rd_r=c88ff08f-9534-45b9-a1f7-baec5e302a83&pd_rd_i=B0CC5NS12T&ats=eyJleHBsaWNpdENhbmRpZGF0ZXMiOiJCMENDNU5TMTJUIiwiYXNpbkludGVyYWN0ZWQiOiJ0cnVlIiwiY3VzdG9tZXJJZCI6IkExOVJGMUNOTDFDSEoyIn0=",
          "price": "",
          "dateOrdered": "2025-06-05",
          "returnStatus": "Not returned",
          "id": "TS5SLlA64oCJ4oK5",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "See all buying options",
          "amazonLink": "https://www.amazon.in/Bevzilla-Instant-Hazelnut-Colombian-Butterscotch/dp/B0CC5NS12T/ref=pd_yo_rr_rp_d_sccl_1_5_atc_o/521-4849824-1748850?pd_rd_w=V4CXP&content-id=amzn1.sym.dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_p=dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_r=YKH56CBQMTKBTCZ6Y0W1&pd_rd_wg=eePsh&pd_rd_r=c88ff08f-9534-45b9-a1f7-baec5e302a83&pd_rd_i=B0CC5NS12T&psc=1",
          "price": "",
          "dateOrdered": "2025-07-24",
          "returnStatus": "Not returned",
          "id": "U2VlIGFsbCBidXlp",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        },
        {
          "itemName": "M.R.P: ₹1,245.00",
          "amazonLink": "https://www.amazon.in/gp/buyagain/ref=pd_yo_rr_rp_d_sccl_1_6/521-4849824-1748850?pd_rd_w=V4CXP&content-id=amzn1.sym.dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_p=dbe73a3f-c628-498e-b2fc-c452afd6ac84&pf_rd_r=YKH56CBQMTKBTCZ6Y0W1&pd_rd_wg=eePsh&pd_rd_r=c88ff08f-9534-45b9-a1f7-baec5e302a83&pd_rd_i=B009WG85ZA&ats=eyJleHBsaWNpdENhbmRpZGF0ZXMiOiJCMDA5V0c4NVpBIiwiYXNpbkludGVyYWN0ZWQiOiJ0cnVlIiwiY3VzdG9tZXJJZCI6IkExOVJGMUNOTDFDSEoyIn0=",
          "price": "",
          "dateOrdered": "2025-09-20",
          "returnStatus": "Not returned",
          "id": "TS5SLlA64oCJ4oK5",
          "extractedAt": "2025-09-28T02:23:15.446Z",
          "autoExtracted": true
        }
      ];

      userDataArray.push(userData);
    }

    return userDataArray;
  }

  /**
   * Store user data in Walrus using quilts and return quilt ID
   */
  private async storeUserData(data: any, identifier?: string): Promise<string> {
    try {
      console.log(`📦 Storing user data in Walrus quilt: ${identifier}`);

      // Convert data to WalrusFile
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const file = WalrusFile.from({
        contents: new TextEncoder().encode(dataString),
        identifier: identifier || `user_data_${Date.now()}`,
        tags: {
          'content-type': 'application/json',
          'created-at': new Date().toISOString(),
        },
      });

      // Write file to Walrus (creates a quilt)
      const results = await this.walrusClient.writeFiles({
        files: [file],
        epochs: 3, // Store for 3 epochs
        deletable: true,
        signer: this.keypair,
      });

      const quiltId = results[0].id;
      console.log(`✅ User data stored successfully, quilt ID: ${quiltId}`);

      return quiltId;
    } catch (error) {
      console.error('❌ Error storing user data in Walrus:', error);
      throw new Error(`Failed to store user data: ${error.message}`);
    }
  }

  /**
   * Create a consolidated blob containing multiple quilt IDs
   */
  private async createConsolidatedBlob(quiltIds: string[]): Promise<string> {
    try {
      console.log(`🔗 Creating consolidated blob with ${quiltIds.length} quilt IDs`);

      // Create a consolidated data structure
      const consolidatedData = {
        type: 'consolidated_dataset',
        quiltIds,
        consolidatedAt: new Date().toISOString(),
        count: quiltIds.length,
        metadata: {
          source: 'random_data_script',
          version: '1.0.0',
          description: 'Consolidated dataset containing random user data'
        }
      };

      // Convert to Uint8Array for blob storage
      const dataBytes = new TextEncoder().encode(JSON.stringify(consolidatedData));

      // Write as a blob (not quilt) for consolidated data
      const { blobId } = await this.walrusClient.writeBlob({
        blob: dataBytes,
        deletable: false, // Consolidated blobs should not be deletable
        epochs: 5, // Store for 5 epochs (longer than individual data)
        signer: this.keypair,
      });

      console.log(`✅ Consolidated blob created successfully: ${blobId}`);

      return blobId;
    } catch (error) {
      console.error('❌ Error creating consolidated blob:', error);
      throw new Error(`Failed to create consolidated blob: ${error.message}`);
    }
  }

  /**
   * Main function to execute the data storage process
   */
  async execute(): Promise<void> {
    try {
      console.log('🚀 Starting random data storage process...\n');

      // Step 1: Generate random user data
      console.log('📊 Step 1: Generating random user data...');
      const userDataArray = this.generateRandomUserData(1);
      console.log(userDataArray);
      console.log(`✅ Generated ${userDataArray.length} random user records\n`);

      // Step 2: Store each user data in individual quilts
      console.log('📦 Step 2: Storing user data in Walrus quilts...');
      const quiltIds: string[] = [];

      for (let i = 0; i < userDataArray.length; i++) {
        const userData = userDataArray[i];
        const identifier = `random_user_${i + 1}_${Date.now()}`;
        const quiltId = await this.storeUserData(userData, identifier);
        quiltIds.push(quiltId);

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`✅ Successfully stored ${quiltIds.length} user data records in quilts\n`);

      // Step 3: Create consolidated blob containing all quilt IDs
      console.log('🔗 Step 3: Creating consolidated blob...');
      const consolidatedBlobId = await this.createConsolidatedBlob(quiltIds);

      console.log('\n🎉 Data storage process completed successfully!');
      console.log('='.repeat(60));
      console.log('📋 SUMMARY:');
      console.log(`   • User data records stored: ${userDataArray.length}`);
      console.log(`   • Quilt IDs: ${quiltIds.join(', ')}`);
      console.log(`   • Consolidated Blob ID (CID): ${consolidatedBlobId}`);
      console.log('='.repeat(60));

      // Step 4: Verify the consolidated blob
      console.log('\n🔍 Step 4: Verifying consolidated blob...');
      const blobBytes = await this.walrusClient.readBlob({ blobId: consolidatedBlobId });
      const content = new TextDecoder().decode(blobBytes);
      const parsedData = JSON.parse(content);

      console.log('✅ Blob verification successful!');
      console.log(`   • Blob size: ${blobBytes.length} bytes`);
      console.log(`   • Contains ${parsedData.count} quilt IDs`);
      console.log(`   • Type: ${parsedData.type}`);
      console.log(`   • Consolidated at: ${parsedData.consolidatedAt}`);

    } catch (error) {
      console.error('❌ Script execution failed:', error);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  // Check for required environment variable
  if (!process.env.WALRUS_PVT_KEY) {
    console.error('❌ Error: WALRUS_PVT_KEY environment variable is required');
    console.log('Please set your Walrus private key:');
    console.log('export WALRUS_PVT_KEY="your_private_key_here"');
    process.exit(1);
  }

  const script = new RandomDataStorageScript();
  await script.execute();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { RandomDataStorageScript };
