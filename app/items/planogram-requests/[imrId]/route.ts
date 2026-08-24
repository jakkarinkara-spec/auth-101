import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json({ success: true });
}


export async function POST() {
  return NextResponse.json({
  "DSDIndicator" : "N",
  "businessAddress" : {
  "city" : "DALIAN",
  "contact" : {
  "name" : "Fiona Lee",
  "phone" : "091-12345678"
  },
  "country" : "CN",
  "countryDesc" : "China",
  "postalCode" : 0,
  "primaryAddressInd" : "Y"
  },
  "contactDetails" : {
  "emailID" : "JULIA@TIMESEAFOOD.COM, FINONALEE@TIMESEAFOOD.COM",
  "fax" : "-",
  "name" : "Time Seafood(Dalian)Co. Ltd.",
  "nameSecondary" : "Sup sync test",
  "phone" : "091-12345678",
  "telex" : "09112345678"
  },
  "contactName" : "Fiona Lee",
  "currencyCode" : "USD",
  "importIndicator" : "Y",
  "invoiceAddress" : {
  "city" : "DALIAN",
  "contact" : {
  "name" : "Fiona Lee",
  "phone" : "091-12345678"
  },
  "country" : "CN",
  "countryDesc" : "China",
  "postalCode" : 0,
  "primaryAddressInd" : "Y"
  },
  "orderAddress" : {
  "city" : "DALIAN",
  "contact" : {
  "name" : "Fiona Lee",
  "phone" : "091-12345678"
  },
  "country" : "CN",
  "countryDesc" : "China",
  "postalCode" : 0,
  "primaryAddressInd" : "Y"
  },
  "paymentMethod" : "TT",
  "postalAddress" : { },
  "remittanceAddress" : {
  "city" : "DALIAN",
  "contact" : {
  "name" : "Fiona Lee",
  "phone" : "091-12345678"
  },
  "country" : "CN",
  "countryDesc" : "China",
  "postalCode" : 0,
  "primaryAddressInd" : "Y"
  },
  "returnCode" : "OK",
  "returnMessage" : "Completed Successfully",
  "returnsAddress" : {
  "city" : "DALIAN",
  "contact" : {
  "name" : "Fiona Lee",
  "phone" : "091-12345678"
  },
  "country" : "CN",
  "countryDesc" : "China",
  "postalCode" : 0,
  "primaryAddressInd" : "Y"
  },
  "status" : "Active",
  "supplier" : 10092,
  "terms" : "04",
  "vatRegion" : 1
  }
    // {
  //   "success": true,
  //   "data":
  //     {
  //       "itemMaintenanceRequestNumber": "IMR-000455",
  //       "requestedByUserId": "buyer-5002",
  //       "requestedByUserName": "Jakkarin JakJa.",
  //       "requestedAt": "2026-07-17T03:25:42.000Z",
  //       "requestedAction": "UPDATE",
  //       "requestStatus": "PENDING",
  //       "items": [
  //         {
  //           "itemCode": "127087",
  //           "itemDesc": "ARO ORANGE JUICE 100% 1L",
  //           "itemDescSecondary": "น้ำส้มอโร่ 100% ขนาด 1 ลิตร",
  //           "currentValue": {
  //             "displayStatus": "Not Display",
  //             "strategicProduct": "No",
  //             "ownBrand": "Yes",
  //             "DisplayFormat": "Normal Shelf",
  //             "DisplayType": "PDQ",
  //             "shelfReady": "SRD",
  //             "group": "Beverage",
  //             "type": "Fruit Juice",
  //             "packaging": "Tetra Pak",
  //             "weight": "1050",
  //             "volume": "1000",
  //             "capacity": "1000",
  //             "flavor": "Orange",
  //             "colorPattern": "Orange",
  //             "smell": "Orange",
  //             "packSize": "12 x 1L",
  //             "sizes": "1L",
  //             "variants": "Original",
  //             "itemAmountInPdqWidth": "4",
  //             "itemAmountInPdqLength": "3",
  //             "itemAmountInPdqHeight": "1",
  //             "muImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000005_MU.1.jpg",
  //               "top": "https://media-mspuat.cpaxtra.co.th/planogram/test.3.jpg",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000005_MU.2.jpg"
  //             },
  //             "pdqImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000005_PDQ.1.jpg",
  //               "top": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000005_PDQ.3.jpg",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/test.2.jpg"
  //             }
  //           },
  //           "newValue": {
  //             "displayStatus": "Display",
  //             "strategicProduct": "Yes",
  //             "ownBrand": "Yes",
  //             "DisplayFormat": "Normal Shelf",
  //             "DisplayType": "PDQ",
  //             "shelfReady": "SRD",
  //             "group": "Beverage",
  //             "type": "Fruit Juice",
  //             "packaging": "Tetra Pak",
  //             "weight": "1070",
  //             "volume": "1000",
  //             "capacity": "1000",
  //             "flavor": "Orange",
  //             "colorPattern": "Orange and White",
  //             "smell": "Fresh Orange",
  //             "packSize": "12 x 1L",
  //             "sizes": "1L",
  //             "variants": "No Sugar Added",
  //             "itemAmountInPdqWidth": "4",
  //             "itemAmountInPdqLength": "3",
  //             "itemAmountInPdqHeight": "1",
  //             "muImages": {
  //               "front": "",
  //               "top": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202605000090_MU.1.jpg",
  //               "side": ""
  //             },
  //             "pdqImages": {
  //               "front": "",
  //               "top": "",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202605000090_MU.1.jpg"
  //             }
  //           },
  //           "itemRequestStatus": "PENDING"
  //         },
  //         {
  //           "itemCode": "1001458",
  //           "itemDesc": "KELLOGS CORN FLAKES 500G",
  //           "itemDescSecondary": "เคลล็อกส์ คอร์นเฟลกส์ ขนาด 500 กรัม",
  //           "currentValue": {
  //             "displayStatus": "Display",
  //             "strategicProduct": "No",
  //             "ownBrand": "No",
  //             "DisplayFormat": "Normal Shelf",
  //             "DisplayType": "Normal",
  //             "shelfReady": "Non-SRD",
  //             "group": "Dry Food",
  //             "type": "Breakfast Cereal",
  //             "packaging": "Box",
  //             "weight": "500",
  //             "volume": "3200",
  //             "capacity": "500",
  //             "flavor": "Original",
  //             "colorPattern": "Red and White",
  //             "smell": "Corn",
  //             "packSize": "1 x 500G",
  //             "sizes": "500G",
  //             "variants": "Original",
  //             "itemAmountInPdqWidth": "",
  //             "itemAmountInPdqLength": "",
  //             "itemAmountInPdqHeight": "",
  //             "muImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000005_MU_1.jpg",
  //               "top": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000005_MU_2.jpg",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000005_MU_3.jpg"
  //             },
  //             "pdqImages": {
  //               "front": "",
  //               "top": "",
  //               "side": ""
  //             }
  //           },
  //           "newValue": {
  //             "displayStatus": "Display",
  //             "strategicProduct": "No",
  //             "ownBrand": "No",
  //             "DisplayFormat": "Normal Shelf",
  //             "DisplayType": "PDQ",
  //             "shelfReady": "SRD",
  //             "group": "Dry Food",
  //             "type": "Breakfast Cereal",
  //             "packaging": "Box",
  //             "weight": "500",
  //             "volume": "3200",
  //             "capacity": "500",
  //             "flavor": "Original",
  //             "colorPattern": "Red and White",
  //             "smell": "Corn",
  //             "packSize": "6 x 500G",
  //             "sizes": "500G",
  //             "variants": "Original",
  //             "itemAmountInPdqWidth": "3",
  //             "itemAmountInPdqLength": "2",
  //             "itemAmountInPdqHeight": "1",
  //             "muImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202606000039_MU.1.jpg",
  //               "top": "",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000005_MU_3.jpg"
  //             },
  //             "pdqImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000005_PDQ_1.jpg",
  //               "top": "",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000005_PDQ_3.jpg"
  //             }
  //           },
  //           "itemRequestStatus": "PENDING"
  //         },
  //         {
  //           "itemCode": "1002671",
  //           "itemDesc": "LAYS CLASSIC POTATO CHIPS 158G",
  //           "itemDescSecondary": "เลย์ มันฝรั่งทอดกรอบ รสคลาสสิก 158 กรัม",
  //           "currentValue": {
  //             "displayStatus": "Display",
  //             "strategicProduct": "Yes",
  //             "ownBrand": "No",
  //             "DisplayFormat": "Normal Shelf",
  //             "DisplayType": "Normal",
  //             "shelfReady": "Non-SRD",
  //             "group": "Snack",
  //             "type": "Potato Chips",
  //             "packaging": "Bag",
  //             "weight": "158",
  //             "volume": "2800",
  //             "capacity": "158",
  //             "flavor": "Classic",
  //             "colorPattern": "Yellow",
  //             "smell": "Potato",
  //             "packSize": "1 x 158G",
  //             "sizes": "158G",
  //             "variants": "Classic",
  //             "itemAmountInPdqWidth": "",
  //             "itemAmountInPdqLength": "",
  //             "itemAmountInPdqHeight": "",
  //             "muImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000006_MU_1.jpg",
  //               "top": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000006_MU_2.jpg",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000006_MU_3.jpg"
  //             },
  //             "pdqImages": {
  //               "front": "",
  //               "top": "",
  //               "side": ""
  //             }
  //           },
  //           "newValue": {
  //             "displayStatus": "Not Display",
  //             "strategicProduct": "Yes",
  //             "ownBrand": "No",
  //             "DisplayFormat": "Hanging Display",
  //             "DisplayType": "Clip Strip",
  //             "shelfReady": "Non-SRD",
  //             "group": "Snack",
  //             "type": "Potato Chips",
  //             "packaging": "Bag",
  //             "weight": "160",
  //             "volume": "2850",
  //             "capacity": "160",
  //             "flavor": "Original",
  //             "colorPattern": "Yellow and Red",
  //             "smell": "Potato",
  //             "packSize": "12 x 160G",
  //             "sizes": "160G",
  //             "variants": "Original Salted",
  //             "itemAmountInPdqWidth": "",
  //             "itemAmountInPdqLength": "",
  //             "itemAmountInPdqHeight": "",
  //             "muImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202605000090_MU.1.jpg",
  //               "top": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000007_MU_2.jpg",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000007_MU_3.jpg"
  //             },
  //             "pdqImages": {
  //               "front": "",
  //               "top": "",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202605000090_MU.1.jpg"
  //             }
  //           },
  //           "itemRequestStatus": "REVIEW_REQUESTED"
  //         },
  //         {
  //           "itemCode": "1003895",
  //           "itemDesc": "NESCAFE RED CUP INSTANT COFFEE 180G",
  //           "itemDescSecondary": "เนสกาแฟ เรดคัพ กาแฟสำเร็จรูป 180 กรัม",
  //           "currentValue": {
  //             "displayStatus": "Display",
  //             "strategicProduct": "No",
  //             "ownBrand": "No",
  //             "DisplayFormat": "Normal Shelf",
  //             "DisplayType": "PDQ",
  //             "shelfReady": "SRD",
  //             "group": "Beverage",
  //             "type": "Instant Coffee",
  //             "packaging": "Glass Jar",
  //             "weight": "180",
  //             "volume": "750",
  //             "capacity": "180",
  //             "flavor": "Original",
  //             "colorPattern": "Red",
  //             "smell": "Roasted Coffee",
  //             "packSize": "6 x 180G",
  //             "sizes": "180G",
  //             "variants": "Red Cup",
  //             "itemAmountInPdqWidth": "3",
  //             "itemAmountInPdqLength": "2",
  //             "itemAmountInPdqHeight": "1",
  //             "muImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000008_MU_1.jpg",
  //               "top": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000008_MU_2.jpg",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000008_MU_3.jpg"
  //             },
  //             "pdqImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000008_PDQ_1.jpg",
  //               "top": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000008_PDQ_2.jpg",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000008_PDQ_3.jpg"
  //             }
  //           },
  //           "newValue": {
  //             "displayStatus": "Display",
  //             "strategicProduct": "No",
  //             "ownBrand": "No",
  //             "DisplayFormat": "Normal Shelf",
  //             "DisplayType": "PDQ",
  //             "shelfReady": "SRD",
  //             "group": "Beverage",
  //             "type": "Instant Coffee",
  //             "packaging": "Glass Jar",
  //             "weight": "200",
  //             "volume": "820",
  //             "capacity": "200",
  //             "flavor": "Original",
  //             "colorPattern": "Red and Black",
  //             "smell": "Rich Roasted Coffee",
  //             "packSize": "6 x 200G",
  //             "sizes": "200G",
  //             "variants": "Red Cup",
  //             "itemAmountInPdqWidth": "3",
  //             "itemAmountInPdqLength": "2",
  //             "itemAmountInPdqHeight": "1",
  //             "muImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000009_MU_1.jpg",
  //               "top": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000009_MU_2.jpg",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000009_MU_3.jpg"
  //             },
  //             "pdqImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000009_PDQ_1.jpg",
  //               "top": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000009_PDQ_2.jpg",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000009_PDQ_3.jpg"
  //             }
  //           },
  //           "itemRequestStatus": "PENDING"
  //         },
  //         {
  //           "itemCode": "1004722",
  //           "itemDesc": "ARO TOMATO KETCHUP 1KG",
  //           "itemDescSecondary": "ซอสมะเขือเทศอโร่ ขนาด 1 กิโลกรัม",
  //           "currentValue": {
  //             "displayStatus": "Display",
  //             "strategicProduct": "No",
  //             "ownBrand": "Yes",
  //             "DisplayFormat": "Normal Shelf",
  //             "DisplayType": "Normal",
  //             "shelfReady": "Non-SRD",
  //             "group": "Dry Food",
  //             "type": "Sauce and Condiment",
  //             "packaging": "Plastic Bottle",
  //             "weight": "1000",
  //             "volume": "1000",
  //             "capacity": "1000",
  //             "flavor": "Tomato",
  //             "colorPattern": "Red",
  //             "smell": "Tomato",
  //             "packSize": "1 x 1KG",
  //             "sizes": "1KG",
  //             "variants": "Original",
  //             "itemAmountInPdqWidth": "",
  //             "itemAmountInPdqLength": "",
  //             "itemAmountInPdqHeight": "",
  //             "muImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000010_MU_1.jpg",
  //               "top": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000010_MU_2.jpg",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000010_MU_3.jpg"
  //             },
  //             "pdqImages": {
  //               "front": "",
  //               "top": "",
  //               "side": ""
  //             }
  //           },
  //           "newValue": {
  //             "displayStatus": "Display",
  //             "strategicProduct": "No",
  //             "ownBrand": "Yes",
  //             "DisplayFormat": "Normal Shelf",
  //             "DisplayType": "Normal",
  //             "shelfReady": "Non-SRD",
  //             "group": "Dry Food",
  //             "type": "Sauce and Condiment",
  //             "packaging": "Plastic Bottle",
  //             "weight": "1000",
  //             "volume": "1000",
  //             "capacity": "1000",
  //             "flavor": "Tomato",
  //             "colorPattern": "Red",
  //             "smell": "Tomato",
  //             "packSize": "1 x 1KG",
  //             "sizes": "1KG",
  //             "variants": "Original",
  //             "itemAmountInPdqWidth": "",
  //             "itemAmountInPdqLength": "",
  //             "itemAmountInPdqHeight": "",
  //             "muImages": {
  //               "front": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000010_MU_1.jpg",
  //               "top": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000010_MU_2.jpg",
  //               "side": "https://media-mspuat.cpaxtra.co.th/planogram/N_N202607000010_MU_3.jpg"
  //             },
  //             "pdqImages": {
  //               "front": "",
  //               "top": "",
  //               "side": ""
  //             }
  //           },
  //           "itemRequestStatus": "PENDING"
  //         }
  //       ],
  //       "reasonForChange": "Update product specifications, display configuration, packaging information and planogram images based on the latest supplier information.",
  //       "actionByUserId": "",
  //       "actionByUserName": "",
  //       "actionAt": "",
  //       "submittedAsRole": "Byer"
  //     }
  //   ,
  //   "error": ""
  // }

);
}
