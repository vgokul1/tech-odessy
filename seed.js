const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Equipment = require('./models/Equipment');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed]: Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Equipment.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();
    console.log('[Seed]: Cleared existing collections.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const ownerPassword = await bcrypt.hash('owner123', salt);
    const customerPassword = await bcrypt.hash('customer123', salt);

    const users = await User.create([
      {
        name: 'Alex Mitchell',
        email: 'admin@rentalhub.com',
        password: adminPassword,
        role: 'admin',
        phone: '+1 (415) 555-0100',
        companyName: 'RentalHub Platform HQ',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        address: { street: '100 Market St, Suite 500', city: 'San Francisco', state: 'CA', zip: '94105' },
      },
      {
        name: 'Marcus Vance',
        email: 'apexgear@rentalhub.com',
        password: ownerPassword,
        role: 'owner',
        phone: '+1 (415) 555-0192',
        companyName: 'Apex Heavy Equipment & Tool Rentals',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        address: { street: '1240 Folsom St', city: 'San Francisco', state: 'CA', zip: '94103' },
      },
      {
        name: 'Elena Rostova',
        email: 'cinepro@rentalhub.com',
        password: ownerPassword,
        role: 'owner',
        phone: '+1 (415) 555-8831',
        companyName: 'CinePro Media & AV Rentals',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        address: { street: '850 Bryant St', city: 'San Francisco', state: 'CA', zip: '94103' },
      },
      {
        name: 'John Miller',
        email: 'john@example.com',
        password: customerPassword,
        role: 'customer',
        phone: '+1 (415) 555-4321',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        address: { street: '450 Sutter St', city: 'San Francisco', state: 'CA', zip: '94108' },
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah@example.com',
        password: customerPassword,
        role: 'customer',
        phone: '+1 (415) 555-7762',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        address: { street: '220 Montgomery St', city: 'San Francisco', state: 'CA', zip: '94104' },
      },
      {
        name: 'Michael Chang',
        email: 'michael@example.com',
        password: customerPassword,
        role: 'customer',
        phone: '+1 (415) 555-9011',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        address: { street: '1600 California St', city: 'San Francisco', state: 'CA', zip: '94109' },
      },
    ]);

    const [adminUser, apexOwner, cineOwner, customerJohn, customerSarah, customerMichael] = users;
    console.log('[Seed]: Created 6 users (Admin, 2 Owners, 3 Customers).');

    // 2. Create Categories
    const categories = await Category.create([
      {
        name: 'Heavy Machinery & Earthmoving',
        slug: 'heavy-machinery',
        description: 'Excavators, skid steers, trenchers, compactors, and earthmoving equipment for major construction.',
        icon: 'bi-truck-flatbed',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Cinema & Photography Gear',
        slug: 'cinema-photography',
        description: 'High-end cinema cameras, full-frame mirrors, anamorphic lenses, gimbals, and studio lighting.',
        icon: 'bi-camera-reels',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Power Tools & Hand Tools',
        slug: 'power-tools',
        description: 'Demolition hammers, cordless rotary drills, concrete saws, tile cutters, and precision hand tools.',
        icon: 'bi-tools',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Audio & Event Production',
        slug: 'audio-event',
        description: 'PA line array systems, digital audio mixing consoles, wireless microphone rigs, and stage lasers.',
        icon: 'bi-speaker',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Lawn & Landscaping Equipment',
        slug: 'lawn-landscaping',
        description: 'Commercial lawn mowers, stump grinders, wood chippers, aerators, and heavy-duty chainsaws.',
        icon: 'bi-tree',
        image: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a07?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Camping, Outdoor & Power',
        slug: 'outdoor-camping',
        description: 'Overland rooftop tents, portable solar generators, off-grid water purifiers, and trail trailers.',
        icon: 'bi-compass',
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
      },
    ]);

    const [catHeavy, catCinema, catTools, catAudio, catLawn, catOutdoor] = categories;
    console.log('[Seed]: Created 6 categories.');

    // 3. Create Equipment Listings
    const equipments = await Equipment.create([
      {
        owner: apexOwner._id,
        title: 'Caterpillar 301.8 Mini Hydraulic Excavator',
        slug: 'cat-301-8-mini-excavator',
        category: catHeavy._id,
        description: 'The Cat 301.8 Mini Excavator delivers power and performance in a compact size to help you work in a wide range of applications. Featuring stick steer, cruise control, retractable undercarriage, and expandable blade.',
        condition: 'Like New',
        dailyRate: 260,
        weeklyRate: 1200,
        securityDeposit: 600,
        specifications: [
          { key: 'Operating Weight', value: '4,461 lbs (2,023 kg)' },
          { key: 'Dig Depth', value: '101.2 in (2,570 mm)' },
          { key: 'Engine Power', value: '21.6 HP (16.1 kW)' },
          { key: 'Bucket Capacity', value: '1.2 cu ft' },
          { key: 'Fuel Type', value: 'Diesel (ultra-low sulfur)' },
        ],
        images: [
          'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        ],
        location: { address: '1240 Folsom St', city: 'San Francisco', state: 'CA', zip: '94103' },
        isAvailable: true,
        rating: 4.9,
        numReviews: 8,
        isFeatured: true,
      },
      {
        owner: apexOwner._id,
        title: 'Bobcat S650 Skid Steer Loader with Bucket',
        slug: 'bobcat-s650-skid-steer',
        category: catHeavy._id,
        description: 'Heavy lifting skid-steer loader designed for civil construction, grading, and material hauling. Features high-flow hydraulics, pressurized enclosed cab with AC/heat, and heavy-duty 74-inch general purpose bucket.',
        condition: 'Good',
        dailyRate: 295,
        weeklyRate: 1400,
        securityDeposit: 750,
        specifications: [
          { key: 'Rated Operating Capacity', value: '2,690 lbs' },
          { key: 'Operating Weight', value: '8,061 lbs' },
          { key: 'Horsepower', value: '74 HP Turbo Diesel' },
          { key: 'Bucket Width', value: '74 inches' },
        ],
        images: [
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
        ],
        location: { address: '1240 Folsom St', city: 'San Francisco', state: 'CA', zip: '94103' },
        isAvailable: true,
        rating: 4.8,
        numReviews: 5,
        isFeatured: true,
      },
      {
        owner: cineOwner._id,
        title: 'Sony FX6 Cinema Line Full-Frame Camera Package',
        slug: 'sony-fx6-cinema-camera-package',
        category: catCinema._id,
        description: 'Complete commercial production cinema kit. Includes Sony FX6 full-frame 4K camera body, 24-70mm f/2.8 GM II lens, 2x 160GB CFexpress Type A cards, card reader, 3x BP-U70 batteries, dual charger, and Pelican 1510 travel case.',
        condition: 'New',
        dailyRate: 195,
        weeklyRate: 850,
        securityDeposit: 500,
        specifications: [
          { key: 'Sensor', value: 'Full-Frame 4K Back-Illuminated CMOS' },
          { key: 'Dynamic Range', value: '15+ Stops in S-Log3' },
          { key: 'Max Frame Rate', value: '4K DCI up to 120fps / FHD 240fps' },
          { key: 'Base ISO', value: 'Dual Base ISO 800 / 12,800' },
          { key: 'Audio Inputs', value: 'Dual XLR on detachable top handle' },
        ],
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=800&q=80',
        ],
        location: { address: '850 Bryant St', city: 'San Francisco', state: 'CA', zip: '94103' },
        isAvailable: true,
        rating: 5.0,
        numReviews: 12,
        isFeatured: true,
      },
      {
        owner: cineOwner._id,
        title: 'DJI Ronin 4D 6K Cinema Gimbal Camera Combo',
        slug: 'dji-ronin-4d-6k-combo',
        category: catCinema._id,
        description: 'Revolutionary 4-axis motorized cinema camera with LiDAR autofocus and wireless video transmission. Perfect for dynamic vehicle shots, continuous one-takes, and tight indoor cinematography without bulky steadicams.',
        condition: 'Like New',
        dailyRate: 230,
        weeklyRate: 990,
        securityDeposit: 700,
        specifications: [
          { key: 'Stabilization', value: 'Active 4-Axis Mechanical Gimbal' },
          { key: 'Recording Format', value: 'Apple ProRes 422 HQ / RAW 6K' },
          { key: 'Focus System', value: 'LiDAR Range Finder with Auto Follow' },
          { key: 'Included Lens', value: 'DJI DL 24mm, 35mm, 50mm f/2.8 Prime Set' },
        ],
        images: [
          'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80',
        ],
        location: { address: '850 Bryant St', city: 'San Francisco', state: 'CA', zip: '94103' },
        isAvailable: true,
        rating: 4.9,
        numReviews: 6,
        isFeatured: false,
      },
      {
        owner: apexOwner._id,
        title: 'Hilti TE 3000-AVR Heavy Demolition Jackhammer',
        slug: 'hilti-te-3000-demolition-jackhammer',
        category: catTools._id,
        description: 'Heavy duty concrete demolition hammer delivering staggering impact energy of 68 Joules. Powered by 120V electric connection, equipped with Active Vibration Reduction (AVR) for comfortable operator use.',
        condition: 'Good',
        dailyRate: 85,
        weeklyRate: 380,
        securityDeposit: 250,
        specifications: [
          { key: 'Impact Energy', value: '68 Joules (50 ft-lbs)' },
          { key: 'Full Hammering Frequency', value: '860 impacts/minute' },
          { key: 'Weight', value: '65.9 lbs' },
          { key: 'Chisels Included', value: '1x Pointed, 1x Flat 3-inch chisel' },
        ],
        images: [
          'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
        ],
        location: { address: '1240 Folsom St', city: 'San Francisco', state: 'CA', zip: '94103' },
        isAvailable: true,
        rating: 4.7,
        numReviews: 9,
        isFeatured: true,
      },
      {
        owner: apexOwner._id,
        title: 'DeWalt 20V MAX XR Brushless 6-Tool Contractor Combo Kit',
        slug: 'dewalt-20v-max-xr-6-tool-kit',
        category: catTools._id,
        description: 'Everything a general contractor or DIY remodeler needs. Includes hammer drill, impact driver, circular saw, reciprocating saw, oscillating multi-tool, LED worklight, 4x 5Ah batteries, fast charger, and rolling tool duffel.',
        condition: 'Like New',
        dailyRate: 45,
        weeklyRate: 190,
        securityDeposit: 150,
        specifications: [
          { key: 'Motor Type', value: 'Brushless High Efficiency' },
          { key: 'Voltage', value: '20V MAX Lithium-Ion' },
          { key: 'Included Batteries', value: '4x 20V 5.0Ah XR Batteries' },
          { key: 'Tools Included', value: 'DCD996 Drill, DCF887 Impact, DCS570 Saw + 3 more' },
        ],
        images: [
          'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
        ],
        location: { address: '1240 Folsom St', city: 'San Francisco', state: 'CA', zip: '94103' },
        isAvailable: true,
        rating: 4.9,
        numReviews: 14,
        isFeatured: false,
      },
      {
        owner: cineOwner._id,
        title: 'QSC K12.2 Active 2000-Watt PA Speaker Pair with Stands',
        slug: 'qsc-k12-2-powered-pa-speakers-pair',
        category: catAudio._id,
        description: 'Industry-standard concert sound system. Pair of 2,000-watt Class-D active speakers with 12-inch woofers, DSP EQ presets, dual heavy-duty speaker stands, and 50ft XLR cable package. Ideal for live bands, DJs, and corporate events up to 500 guests.',
        condition: 'Like New',
        dailyRate: 110,
        weeklyRate: 480,
        securityDeposit: 300,
        specifications: [
          { key: 'Power Output', value: '2,000 Watts Peak Class-D per speaker' },
          { key: 'Frequency Response', value: '45 Hz – 20 kHz' },
          { key: 'Max SPL', value: '132 dB peak' },
          { key: 'Coverage Angle', value: '75° Axisymmetric' },
        ],
        images: [
          'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
        ],
        location: { address: '850 Bryant St', city: 'San Francisco', state: 'CA', zip: '94103' },
        isAvailable: true,
        rating: 4.9,
        numReviews: 11,
        isFeatured: true,
      },
      {
        owner: cineOwner._id,
        title: 'Pioneer DJ DDJ-FLX10 4-Channel DJ Controller Rig',
        slug: 'pioneer-dj-ddj-flx10-controller',
        category: catAudio._id,
        description: 'Flagship 4-channel DJ controller for rekordbox and Serato DJ Pro. Features real-time track separation (stems), on-jog display, MAGVEL crossfader, dual USB-C ports, and flight case with sliding laptop shelf.',
        condition: 'New',
        dailyRate: 85,
        weeklyRate: 360,
        securityDeposit: 250,
        specifications: [
          { key: 'Channels', value: '4 Channels with 8 Performance Pads each' },
          { key: 'Compatibility', value: 'rekordbox & Serato DJ Pro Hardware Unlock' },
          { key: 'Soundcard', value: '24-bit / 44.1 kHz' },
          { key: 'Inputs/Outputs', value: '2x Mic, 2x Phono/Line, XLR Master Out' },
        ],
        images: [
          'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
        ],
        location: { address: '850 Bryant St', city: 'San Francisco', state: 'CA', zip: '94103' },
        isAvailable: true,
        rating: 4.8,
        numReviews: 7,
        isFeatured: false,
      },
      {
        owner: apexOwner._id,
        title: 'Husqvarna 450 Rancher Gas Chainsaw 20-Inch Bar',
        slug: 'husqvarna-450-rancher-chainsaw',
        category: catLawn._id,
        description: 'Powerful all-round 50.2cc chainsaw for demanding tree cutting, firebreak management, and heavy timber felling. Equipped with X-Torq engine, LowVib anti-vibration dampers, and Smart Start decompression valve.',
        condition: 'Good',
        dailyRate: 50,
        weeklyRate: 210,
        securityDeposit: 100,
        specifications: [
          { key: 'Cylinder Displacement', value: '50.2 cc' },
          { key: 'Power Output', value: '3.2 HP' },
          { key: 'Bar Length', value: '20 inches' },
          { key: 'Weight (excl. cutting gear)', value: '11.2 lbs' },
        ],
        images: [
          'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a07?auto=format&fit=crop&w=800&q=80',
        ],
        location: { address: '1240 Folsom St', city: 'San Francisco', state: 'CA', zip: '94103' },
        isAvailable: true,
        rating: 4.6,
        numReviews: 4,
        isFeatured: false,
      },
      {
        owner: apexOwner._id,
        title: 'Toro Dingo TX 1000 Wide Track Utility Mini Loader',
        slug: 'toro-dingo-tx-1000-mini-loader',
        category: catLawn._id,
        description: 'Incredible maneuverability and lifting capacity in narrow access areas. Fits through standard 42-inch gates. Stand-on operator platform with intuitive drive controls. Includes 42-inch dirt bucket.',
        condition: 'Like New',
        dailyRate: 240,
        weeklyRate: 1100,
        securityDeposit: 500,
        specifications: [
          { key: 'Operating Capacity', value: '1,075 lbs' },
          { key: 'Hinge Pin Height', value: '81 inches' },
          { key: 'Engine', value: '24.9 HP Kubota Diesel' },
          { key: 'Width', value: '41 inches' },
        ],
        images: [
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
        ],
        location: { address: '1240 Folsom St', city: 'San Francisco', state: 'CA', zip: '94103' },
        isAvailable: true,
        rating: 4.9,
        numReviews: 7,
        isFeatured: true,
      },
      {
        owner: apexOwner._id,
        title: 'Roofnest Condor 2 Overland Hardshell Rooftop Tent',
        slug: 'roofnest-condor-2-rooftop-tent',
        category: catOutdoor._id,
        description: 'Premium aerodynamic hardshell rooftop tent accommodating 2-3 adults. Sets up in under 60 seconds with integrated gas struts. Includes comfortable memory foam mattress, telescopic aluminum ladder, and LED interior lighting strip.',
        condition: 'New',
        dailyRate: 65,
        weeklyRate: 290,
        securityDeposit: 200,
        specifications: [
          { key: 'Sleeping Capacity', value: '2-3 Adults' },
          { key: 'Mattress Dimensions', value: '81" L x 53" W' },
          { key: 'Shell Material', value: 'ASA/ABS polymer with aluminum framing' },
          { key: 'Weight', value: '155 lbs' },
        ],
        images: [
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
        ],
        location: { address: '1240 Folsom St', city: 'San Francisco', state: 'CA', zip: '94103' },
        isAvailable: true,
        rating: 5.0,
        numReviews: 10,
        isFeatured: false,
      },
      {
        owner: cineOwner._id,
        title: 'Jackery Solar Generator 2000 Pro with 2x 200W Solar Panels',
        slug: 'jackery-solar-generator-2000-pro',
        category: catOutdoor._id,
        description: 'Massive 2,160Wh power station with 2,200W pure sine wave AC inverter. Easily powers high-demand tools, film lights, CPAP machines, and camping appliances off the grid. Recharges fully in 2.5 hours via included SolarSaga panels.',
        condition: 'Like New',
        dailyRate: 75,
        weeklyRate: 320,
        securityDeposit: 250,
        specifications: [
          { key: 'Capacity', value: '2,160 Watt-hours (Wh)' },
          { key: 'AC Output', value: '2,200W continuous (4,400W surge)' },
          { key: 'Ports', value: '3x AC 120V, 2x USB-C 100W PD, 2x USB-A QC3.0' },
          { key: 'Solar Input', value: 'Dual MPPT up to 1,400W solar input' },
        ],
        images: [
          'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
        ],
        location: { address: '850 Bryant St', city: 'San Francisco', state: 'CA', zip: '94103' },
        isAvailable: true,
        rating: 4.9,
        numReviews: 8,
        isFeatured: true,
      },
    ]);

    const [catExcavator, bobcatLoader, sonyCamera, djiGimbal, hiltiHammer] = equipments;
    console.log('[Seed]: Created 12 equipment listings.');

    // 4. Create Sample Bookings across lifecycles
    const now = new Date();
    const d1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const d2 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const d3 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const d4 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    const past1 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const past2 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    const activeStart = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const activeEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const bookings = await Booking.create([
      {
        equipment: catExcavator._id,
        customer: customerJohn._id,
        owner: apexOwner._id,
        startDate: d1,
        endDate: d2,
        totalDays: 3,
        dailyRate: catExcavator.dailyRate,
        rentAmount: 3 * catExcavator.dailyRate,
        securityDeposit: catExcavator.securityDeposit,
        totalAmount: 3 * catExcavator.dailyRate + catExcavator.securityDeposit,
        status: 'pending',
        deliveryMethod: 'delivery',
        deliveryAddress: '742 Evergreen Terrace, San Francisco, CA',
        notes: 'Need machine by 7:30 AM on day 1 for plumbing trench excavation.',
      },
      {
        equipment: sonyCamera._id,
        customer: customerSarah._id,
        owner: cineOwner._id,
        startDate: d3,
        endDate: d4,
        totalDays: 3,
        dailyRate: sonyCamera.dailyRate,
        rentAmount: 3 * sonyCamera.dailyRate,
        securityDeposit: sonyCamera.securityDeposit,
        totalAmount: 3 * sonyCamera.dailyRate + sonyCamera.securityDeposit,
        status: 'confirmed',
        deliveryMethod: 'pickup',
        notes: 'Filming a commercial downtown. Picking up equipment in the morning.',
      },
      {
        equipment: hiltiHammer._id,
        customer: customerMichael._id,
        owner: apexOwner._id,
        startDate: activeStart,
        endDate: activeEnd,
        totalDays: 4,
        dailyRate: hiltiHammer.dailyRate,
        rentAmount: 4 * hiltiHammer.dailyRate,
        securityDeposit: hiltiHammer.securityDeposit,
        totalAmount: 4 * hiltiHammer.dailyRate + hiltiHammer.securityDeposit,
        status: 'active',
        deliveryMethod: 'pickup',
        notes: 'Driveway concrete demo project.',
      },
      {
        equipment: bobcatLoader._id,
        customer: customerJohn._id,
        owner: apexOwner._id,
        startDate: past1,
        endDate: past2,
        totalDays: 4,
        dailyRate: bobcatLoader.dailyRate,
        rentAmount: 4 * bobcatLoader.dailyRate,
        securityDeposit: bobcatLoader.securityDeposit,
        totalAmount: 4 * bobcatLoader.dailyRate + bobcatLoader.securityDeposit,
        status: 'returned',
        deliveryMethod: 'delivery',
        notes: 'Site grading completed successfully.',
      },
    ]);

    const [, , , returnedBooking] = bookings;
    console.log('[Seed]: Created 4 sample bookings across lifecycles (pending, confirmed, active, returned).');

    // 5. Create Sample Reviews
    await Review.create([
      {
        equipment: bobcatLoader._id,
        customer: customerJohn._id,
        booking: returnedBooking._id,
        rating: 5,
        comment: 'The Bobcat S650 performed flawlessly on our residential grading project. Hydraulic response was smooth, clean cab with crisp A/C, and Apex Rentals made pickup and drop-off totally effortless. Highly recommended!',
      },
      {
        equipment: sonyCamera._id,
        customer: customerSarah._id,
        rating: 5,
        comment: 'Elena at CinePro kept this FX6 in pristine museum condition. Dual CFexpress cards made shooting high frame rate 4K flawless without buffer lag. Will definitely rent again for our next shoot!',
      },
      {
        equipment: catExcavator._id,
        customer: customerMichael._id,
        rating: 5,
        comment: 'Saved us 3 days of backbreaking manual labor on our landscaping retaining wall project. Stick steer was intuitive even for someone who hasn’t driven an excavator in years.',
      },
    ]);

    // Recalculate equipment ratings
    await Review.calculateAverageRating(bobcatLoader._id);
    await Review.calculateAverageRating(sonyCamera._id);
    await Review.calculateAverageRating(catExcavator._id);
    console.log('[Seed]: Created verified reviews and updated ratings.');

    // 6. Create Notifications
    await Notification.create([
      {
        recipient: apexOwner._id,
        sender: customerJohn._id,
        title: 'New Booking Request',
        message: 'John Miller requested to rent "Caterpillar 301.8 Mini Hydraulic Excavator" for 3 day(s).',
        type: 'booking',
        link: '/owner/bookings',
        isRead: false,
      },
      {
        recipient: customerSarah._id,
        sender: cineOwner._id,
        title: 'Booking Confirmed!',
        message: 'Your reservation for "Sony FX6 Cinema Line Full-Frame Camera Package" is confirmed.',
        type: 'status',
        link: '/dashboard',
        isRead: false,
      },
      {
        recipient: adminUser._id,
        sender: customerJohn._id,
        title: 'Platform Milestone',
        message: 'Welcome to the RentalHub Admin Control Panel. All systems operational.',
        type: 'system',
        link: '/admin',
        isRead: true,
      },
    ]);
    console.log('[Seed]: Created sample user notifications.');

    console.log('\n========================================');
    console.log('🎉 RENTALHUB DATABASE SEEDING COMPLETE!');
    console.log('========================================');
    console.log('Login Credentials:');
    console.log('👑 Admin:     admin@rentalhub.com     / admin123');
    console.log('🏢 Owner 1:   apexgear@rentalhub.com  / owner123');
    console.log('🏢 Owner 2:   cinepro@rentalhub.com   / owner123');
    console.log('👤 Customer:  john@example.com        / customer123');
    console.log('👤 Customer:  sarah@example.com       / customer123');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
