// chal.js
// rpachallenge.com
//
const puppeteer  = require('puppeteer');
const Excel      = require('exceljs');
const fs         = require('fs');
//
const myURL      = 'http://rpachallenge.com';
//
const myargs = process.argv.slice(2); // skip 1,2 (node, file.js)
const myexcelfile = myargs[0] || 'sdlfksf' ; // get the xlsx path+filename
//
const debug = 1 ;

if ( fs.existsSync(myexcelfile)) 
{
   console.log("debug: myexcelfile exists ");
} else {
   console.log("ERROR: myexcelfile missing???");
   process.exit(2);
}

// globals?
var mylist = []; // will hold excel data...
var v ;          // will hold one iter of mylist 

//
// excel
// 7 fields
// first, last, company, role, addr, email, phone
//
const workbook = new Excel.Workbook();
workbook.xlsx.readFile(myexcelfile).then(function() {
        const worksheet = workbook.getWorksheet();
        //worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
        worksheet.eachRow( function(row, rowNumber) {

          if ( rowNumber > 1 ) 
          {
            console.log("Row " + rowNumber + " = " + JSON.stringify(row.values)); // why is 1st value null?? col a has value?
            //row.eachCell( function(cell,colNumber) {
               //console.log("Cell " + colNumber + ' = ' + cell.value );
               //mylist.push(cell.value); //should just be col a only...
            //let myfirst   = worksheet.getCell('A'+rowNumber) ;
            //let mylast    = worksheet.getCell('B'+rowNumber) ;
            //let mycompany = worksheet.getCell('C'+rowNumber) ;
            //let myrole    = worksheet.getCell('D'+rowNumber) ;
            //let myaddr    = worksheet.getCell('E'+rowNumber) ;
            //let myemail   = worksheet.getCell('F'+rowNumber) ;
            //let myphone   = worksheet.getCell('G'+rowNumber) ;
            //mylist.push( { myfirst, mylast, mycompany, myrole, myaddr, myemail, myphone  } );
            let blah = new Object() ;
            blah['First Name']      = worksheet.getCell('A'+rowNumber);
            blah['Last Name']       = worksheet.getCell('B'+rowNumber);
            blah['Company Name']    = worksheet.getCell('C'+rowNumber);
            blah['Role in Company'] = worksheet.getCell('D'+rowNumber);
            blah['Address']         = worksheet.getCell('E'+rowNumber);
            blah['Email']           = worksheet.getCell('F'+rowNumber);
            blah['Phone Number']    = worksheet.getCell('G'+rowNumber);
            mylist.push( blah ) ; //array of objects...
          }//endif

        }); //worksheet.eachRow
}); // workbook.readfile???


if (debug) console.log("debug: post excel... myexcelfile= " + myexcelfile + " ::"); // this pops up at top? async vs promise thingy??? .then thing? 

//
// 
//
(async () => {
          //const browser = await puppeteer.launch( {headless: false, devtools: true , defaultViewport: { width: 1300, height: 820}  });
          //const browser = await puppeteer.launch( {headless: true, defaultViewport: { width: 1024, height: 600}  });
          const browser = await puppeteer.launch( {headless: false, defaultViewport: { width: 1024, height: 800}, executablePath: 'chromium-browser'  });
          const page    = await browser.newPage();
        
          await page.setViewport({
            width: 1024,
            height: 800
          });
         await page.goto( myURL , { waitUntil: 'domcontentloaded' }); 
       
         console.log("debug: post goto - will wait for 3 secs...");
         await page.waitFor(3000); // is there a better way??? loop until detect something ?


         // wat about clicking that 'start button'??? to 'officially' start challenge?
         console.log("debug: wait 30secs? give time to click on start button manually???");
         await page.waitFor(30000); 

         // there's only 1 button? ;)
         await page.click('button');
         console.log("debug: clicked on 'button'?");
         await page.waitFor(3000);


         // 
         // v of mylist (a record)
         //
         let mycounter = 0;
         for( v of mylist)
         {
            // get all labels...
            let lillabels = await page.$$('label'); //array of elementhandles
            mycounter++;
            console.log("forloop: c=" + mycounter + " v= " + v );
            for (let lillabel of lillabels)
            {
               console.log("...forloop: lillabel");
               // elementhandle
               //console.log("...forloop: lillabel= " + lillabel + "|type=" + lillabel.type );
               //console.log("...forloop: lillabel= " + lillabel + "|2str=" + lillabel.toString());
               
               // jshandle
               let lltxtprop = await lillabel.getProperty('innerText').catch((err) => { console.log("lillabel => txt ", err); });
               // string?
               let lltxt     = await lltxtprop.jsonValue();
               const vtxt      = v[lltxt].toString() ;
               console.log("...forloop: lillabel : lltxt=" + lltxt + " |v= " + vtxt );

               // gotcha - sometimes nextSibling is <b> and not <input>...do while loop needed?
               //let myinput = await page.evaluateHandle( el => el.nextElementSibling , lillabel ).catch((err) => { console.log("ERROR: evalH => ",err);});

               let myinput = await page.evaluateHandle( el => el.nextElementSibling , lillabel ).catch((err) => { console.log("ERROR: evalH => ",err);});
               //
               let mytagcheck = await page.evaluate( el => el.tagName , myinput ) ;
               console.log( "mytagcheck => " + mytagcheck );
               if ( mytagcheck != 'INPUT' )
               {
                    myinput = await page.evaluateHandle( el => el.nextElementSibling , myinput ).catch((err) => { console.log("ERROR: evalH => ",err);});
               }

               console.log( "myinput => " +  await ( await myinput.getProperty('outerHTML')).jsonValue()) ;
               await myinput.type( vtxt , { delay: 10} );
               await page.waitFor(1000); //sanity?

            }//for lillabels

            // sshot
            await page.screenshot({path: "ss_" + mycounter + ".png"} );
            await page.waitFor(5000);

            // click submit
            await page.click('input[type="submit"]');

            console.log("................................. clicked submit ................................");
            await page.waitFor(10000);
          }//for v

         console.log("debug: about to close...");
         await page.waitFor(999999);
         await browser.close();
         console.log("debug: closing browser...");
})(); //pptr



console.log("debug: should be all done with excel...prior to starting pptr....");




