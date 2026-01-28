const { db } = require('./config/firebase');

async function checkCategories() {
    const snap = await db.collection('workers').get();
    const cats = {};

    snap.docs.forEach(doc => {
        const cat = doc.data().serviceCategory;
        if (cat) cats[cat] = (cats[cat] || 0) + 1;
    });

    console.log('All serviceCategory values with counts:');
    Object.entries(cats).sort().forEach(([k, v]) => {
        console.log(`  ${k}: ${v} workers`);
    });
    console.log(`\nTotal unique categories: ${Object.keys(cats).length}`);
    process.exit(0);
}

checkCategories();
