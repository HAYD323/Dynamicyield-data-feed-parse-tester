module.exports = {
    parser: parse,
    feed1FileName: "dy-product-export",
    feed2FileName: "Smart_Collections"
}
/********************************************************************************************************************/
/* ADD FILES TO ASSETS FOLDER AND UPDATE NAME ABOVE (without ext as it should be a csv) IF THE ABOVE IS NOT CORRECT */
/********************************************************************************************************************/

function parse(feed1, feed2){
  // Create Feed 1 - Products
  let mappedFeed1 = feed1.map(function(item,index){
    let description = item['Body HTML'].replace(/(<([^>]+)>)/gi, "");
    let descriptionSplit = description.split('.')
    let newItem = {}
    newItem.url = item.URL
    newItem.name = item.Title.trim();
    if (newItem.name.indexOf(' -') == newItem.name.length - 2) {
      newItem.name = newItem.name.substring(0, newItem.name.length - 1).trim();
    }
    newItem.group_id = item.ID;
    newItem.in_stock = item['Variant Inventory Qty'] > 0 ? true : false;
    //sku is a unique identifer
    newItem.sku = item.ID;
    newItem.image_url = item['Image Src'];
    newItem.image_alt = item['Image Alt Text'];
    newItem.price = item['Variant Price'];
    newItem.compareAtPrice = item['Variant Compare At Price'];
    descriptionSplit = descriptionSplit[0].split('!-- split --')
    newItem.description = descriptionSplit[0];
    newItem.description = newItem.description + '.';
    newItem.truncated_description = descriptionSplit[0].length > 1? descriptionSplit[0].trim().length > 50? descriptionSplit[0].slice(0,47).trim() + "..." : descriptionSplit[0] : ".";
    return newItem
  })
  
  // Create Feed 1 - review skus
  let mappedFeed1Reviews = feed1.map(function(item){
    let newItem = {}
    newItem.review_skus = [item['Variant SKU']]
    //sku is a unique identifer
    newItem.sku = item.ID;
    newItem.group_id = item.ID;
    return newItem
  })
  
  // Reduce Feed 1 to group all skus based on product ID
  var mappedFeed1ReviewsReduced = Object.values(mappedFeed1Reviews.reduce((productIds, { group_id, review_skus }) => {
    var product = productIds[group_id]
    if (!product) {
      productIds[group_id] = {
        group_id: group_id,
        review_skus: [...review_skus]
      }
    } else {
      product.review_skus =  [...product.review_skus, ...review_skus];
    }
    
    return productIds
  }, {}))
  
  var mappedFeed1ReviewsRefined = mappedFeed1ReviewsReduced.map((elm) => {
    elm.review_skus = elm.review_skus.filter((x)=>{return x.length > 0}).join()
    return elm;
  });
  
  
  // Create Feed 2 - Collections and related products
  let mappedFeed2 = feed2.map(function(item){
    var newItem = {}
    newItem.productId = item['Product: ID']
    newItem.categories = [item.Title];
    return newItem
  })
  
  // Reduce Feed 2 to group all collection titles based on product ID
  var mappedFeed2Reduced = Object.values(mappedFeed2.reduce((productIds, { productId, categories }) => {
    var product = productIds[productId]
    if (!product) {
      productIds[productId] = {
        productId: productId,
        categories: [...categories]
      }
    } else {
      product.categories =  [...product.categories, ...categories]
    }
    
    return productIds
  }, {}))

  //Join the array of collection titles for each product and replace ',' with '|'
  var mappedFeed2Refined = mappedFeed2Reduced.map((elm) => {
    elm.categories = elm.categories.join()
    elm.categories = elm.categories.replace(/,/g, '|')
    return elm;
  });
  
  // Join feeds together
  const result = mappedFeed1.map(f1 => ({ ...f1, ...mappedFeed2Refined.find(f2 => f2.productId === f1.group_id) }));
  
  const result2 = result.map(f1 => ({ ...f1, ...mappedFeed1ReviewsRefined.find(f2 => f2.group_id === f1.productId) }));
  
  let addColumns = result2.map(function(item){
    let collectionTitles = ''
    if(typeof item.categories === 'string' && item.categories !== null && item.categories !== undefined) {
      collectionTitles = item.categories.split('|')
    }

      
      item.animal_type = "";
      item.age = "";
      item.ailment = "";
      item.product_type = "";
      item.brand = "";
      
      for (i = 0; i < collectionTitles.length; i++) {
        switch(collectionTitles[i]) {
            case 'Cat':
                if (item.animal_type.length > 0) {
                  item.animal_type = item.animal_type + '|Cat';
                } else {
                  item.animal_type = 'Cat';
                }
              break;
            case 'Dog':
                if (item.animal_type.length > 0) {
                    item.animal_type = item.animal_type + '|Dog';
                  } else {
                    item.animal_type = 'Dog';
                  }
              break;
            case 'Horse':
                if (item.animal_type.length > 0) {
                    item.animal_type = item.animal_type + '|Horse';
                  } else {
                    item.animal_type = 'Horse';
                  }
              break;
            case 'Human':
                if (item.animal_type.length > 0) {
                    item.animal_type = item.animal_type + '|Human';
                  } else {
                    item.animal_type = 'Human';
                  }
              break;
            case '0-4':
                if (item.age.length > 0) {
                  item.age = item.age + '|0-4';
                } else {
                  item.age = '0-4';
                }
              break;
            case '5-7':
                if (item.age.length > 0) {
                    item.age = item.age + '|5-7';
                  } else {
                    item.age = '5-7';
                  }
              break;
            case '8 And Over':
                if (item.age.length > 0) {
                    item.age = item.age + '|8 And Over';
                  } else {
                    item.age = '8 And Over';
                  }
              break;
            case 'Calming':
                if (item.ailment.length > 0) {
                    item.ailment = item.ailment + '|Calming';
                  } else {
                    item.ailment = 'Calming';
                  }
              break;
            case 'Coat':
                if (item.ailment.length > 0) {
                    item.ailment = item.ailment + '|Coat';
                  } else {
                    item.ailment = 'Coat';
                  }
              break;
            case 'Digestive Health':
                if (item.ailment.length > 0) {
                    item.ailment = item.ailment + '|Digestive Health';
                  } else {
                    item.ailment = 'Digestive Health';
                  }
              break;
            case 'Joints':
                if (item.ailment.length > 0) {
                    item.ailment = item.ailment + '|Joints';
                  } else {
                    item.ailment = 'Joints';
                  }
              break;
            case 'Skin':
                if (item.ailment.length > 0) {
                    item.ailment = item.ailment + '|Skin';
                  } else {
                    item.ailment = 'Skin';
                  }
              break;
            case 'Sample':
                if (item.product_type.length > 0) {
                    item.product_type = item.product_type + '|Sample';
                  } else {
                    item.product_type = 'Sample';
                  }
              break;
            case 'Subscription':
                if (item.product_type.length > 0) {
                    item.product_type = item.product_type + '|Subscription';
                  } else {
                    item.product_type = 'Subscription';
                  }
              break;
            case 'YuCALM':
                if (item.brand.length > 0) {
                    item.brand = item.brand + '|YuCALM';
                  } else {
                    item.brand = 'YuCALM';
                  }
              break;
            case 'YuDERM':
                if (item.brand.length > 0) {
                    item.brand = item.brand + '|YuDERM';
                  } else {
                    item.brand = 'YuDERM';
                  }
              break;
            case 'YuDIGEST':
                if (item.brand.length > 0) {
                    item.brand = item.brand + '|YuDIGEST';
                  } else {
                    item.brand = 'YuDIGEST';
                  }
              break;
            case 'YuMEGA':
                if (item.brand.length > 0) {
                    item.brand = item.brand + '|YuMEGA';
                  } else {
                    item.brand = 'YuMEGA';
                  }
              break;
            case 'YuMOVE':
                if (item.brand.length > 0) {
                    item.brand = item.brand + '|YuMOVE';
                  } else {
                    item.brand = 'YuMOVE';
                  }
              break;  
            case 'iMOVE':
                if (item.brand.length > 0) {
                    item.brand = item.brand + '|iMOVE';
                  } else {
                    item.brand = 'iMOVE';
                  }
              break;  
            default:
              break;
        }
      }
      return item;
    });
    
    // Filter and remove any results that have mandatory data missing
  let filtered = addColumns.filter(function(el) { return el.image_url !== "" && el.sku !== "" && el.price !== "" && el.price !== "0.00" && el.group_id !== "" && el.categories && el.categories !== '' && (el.description && el.description.toLowerCase().indexOf('warning') < 0) && (el.name.toLowerCase().indexOf('starter') < 0 && el.name.toLowerCase().indexOf('free') < 0 && el.name.toLowerCase().indexOf('sample') < 0 && el.categories.toLowerCase().indexOf('sample') < 0 )});

  return filtered
  
  // Map Feed 3 - TrustPlot Reviews
  // let mappedFeed3 = feed3.map(function(item){
  //   let newItem = {}
  //   newItem.stars = [item.stars]
  //   newItem.review_sku = item.product_sku
  //   return newItem
  // })
  
  // Reduce feed 3 so it only shows sku and star ratings
  // var feed3Reduced = Object.values(mappedFeed3.reduce((productIds, { review_sku, stars }) => {
  //   var product = productIds[review_sku]
  //   if (!product) {
  //     productIds[review_sku] = {
  //       review_sku: review_sku,
  //       stars: [...stars]
  //     }
  //   } else {
  //     product.stars =  [...product.stars, ...stars]
  //   }
    
  //   return productIds
  // }, {}))
  
  // Refine feed 3 to accumulate all ratings for each sku and find an average
  // var feed3Refined = feed3Reduced.map((elm) => {
  //   function round(value, step) {
  //     step || (step = 1.0);
  //     var inv = 1.0 / step;
  //     return Math.round(value * inv) / inv;
  //   }
  //   var total = elm.stars.reduce((a, b) => Number(a) + Number(b), 0)
  //   var avg = total/elm.stars.length
  //   elm.stars = round(avg, .5)
  //   return elm;
  // });
  
  // return finalResult = filtered.map(f1 => ({ ...f1, ...feed3Refined.find(f2 => f2.review_sku === f1.review_sku) }));
  
}
