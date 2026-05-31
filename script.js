/* ═══════════════════════════════════════════════════════
   EESA NITK — Client Interaction & Database Integrations
   Mobile Menu · Scroll Reveal · Supabase Authentication & CRUD
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
    
    // ── 1. Database Configuration & Setup ──
    let supabase = null;
    let isDbOnline = false;
    let isSuperAdmin = false;
    let isAlumni = false;
    let isStudent = false;
    let myAlumniId = null;
    let loggedInEmail = null;

    // Check if configuration matches default placeholders
    const isPlaceholder = !SUPABASE_CONFIG || 
                          !SUPABASE_CONFIG.url || 
                          SUPABASE_CONFIG.url.includes('YOUR_SUPABASE') || 
                          !SUPABASE_CONFIG.anonKey || 
                          SUPABASE_CONFIG.anonKey.includes('YOUR_SUPABASE');

    if (!isPlaceholder) {
        try {
            supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            isDbOnline = true;
        } catch (e) {
            console.error("Supabase initialization failed:", e);
        }
    }

    // ── 2. Check Authentication State ──
    const checkAuth = async () => {
        if (isDbOnline && supabase) {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    loggedInEmail = session.user.email;
                    const metadata = session.user.user_metadata || {};
                    const userRole = metadata.role || 'student'; // Fallback to student role
                    
                    if (loggedInEmail === 'admin@eesanitk.in') {
                        isSuperAdmin = true;
                        document.body.classList.add('admin-active');
                    } else if (userRole === 'alumni') {
                        isAlumni = true;
                        document.body.classList.add('admin-active');
                    } else {
                        isStudent = true;
                        document.body.classList.add('admin-active');
                    }
                }
            } catch (e) {
                console.error("Auth status verification error:", e);
            }
        } else {
            // Local preview administrator/alumni/student bypass
            const localBypass = localStorage.getItem('eesa_mock_admin');
            const mockRole = localStorage.getItem('eesa_mock_role');
            
            if (localBypass === 'true' || mockRole === 'admin') {
                isSuperAdmin = true;
                document.body.classList.add('admin-active');
            } else if (mockRole === 'alumni') {
                isAlumni = true;
                loggedInEmail = localStorage.getItem('eesa_mock_alumni_email') || 'mock-alumni@eesanitk.in';
                document.body.classList.add('admin-active');
            } else if (mockRole === 'student') {
                isStudent = true;
                loggedInEmail = localStorage.getItem('eesa_mock_student_email') || 'mock-student@eesanitk.in';
                document.body.classList.add('admin-active');
            }
        }
    };
    await checkAuth();

    const handleLogout = async (e) => {
        if (e) e.preventDefault();
        if (isDbOnline && supabase) {
            await supabase.auth.signOut();
        }
        localStorage.removeItem('eesa_mock_admin');
        localStorage.removeItem('eesa_mock_alumni_email');
        localStorage.removeItem('eesa_mock_student_email');
        localStorage.removeItem('eesa_mock_role');
        window.location.href = 'index.html';
    };

    const renderNavbarAuthButton = () => {
        const navLinks = document.getElementById('navLinks');
        const navMobile = document.getElementById('navMobile');
        
        if (!navLinks || !navMobile) return;

        // Clean up any existing login/logout buttons
        const existingButtons = document.querySelectorAll('.nav-login-btn');
        existingButtons.forEach(btn => btn.remove());

        const isLoggedIn = isSuperAdmin || isAlumni || isStudent || !!loggedInEmail;

        if (isLoggedIn) {
            // Render Sign Out buttons
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.className = 'nav-link nav-login-btn';
            logoutLink.id = 'navLogoutBtn';
            logoutLink.textContent = 'Sign Out';
            logoutLink.addEventListener('click', handleLogout);
            navLinks.appendChild(logoutLink);

            const logoutLinkMobile = document.createElement('a');
            logoutLinkMobile.href = '#';
            logoutLinkMobile.className = 'nav-link nav-login-btn';
            logoutLinkMobile.id = 'navLogoutBtnMobile';
            logoutLinkMobile.textContent = 'Sign Out';
            logoutLinkMobile.addEventListener('click', handleLogout);
            navMobile.appendChild(logoutLinkMobile);
        } else {
            // Render Portal Login buttons
            const loginLink = document.createElement('a');
            loginLink.href = 'login.html';
            loginLink.className = 'nav-link nav-login-btn';
            loginLink.textContent = 'Portal Login';
            navLinks.appendChild(loginLink);

            const loginLinkMobile = document.createElement('a');
            loginLinkMobile.href = 'login.html';
            loginLinkMobile.className = 'nav-link nav-login-btn';
            loginLinkMobile.textContent = 'Portal Login';
            navMobile.appendChild(loginLinkMobile);
        }
    };
    renderNavbarAuthButton();

    // Show Database Offline warning banner for previewing
    if (isPlaceholder) {
        const warningBanner = document.createElement('div');
        warningBanner.className = 'db-offline-banner';
        warningBanner.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Database Offline: Preview mode active. Edit settings in config.js to connect Supabase.
        `;
        document.body.insertBefore(warningBanner, document.body.firstChild);
    }

    // ── 3. Seed / Default Mock Data Definitions ──
    const DEFAULT_PROJECTS = [
        { id: "p1", title: "Smart Grid Monitoring System", description: "IoT-based real-time power grid monitoring using ESP32 and LoRa communication with cloud dashboard analytics.", category: "Hardware", tags: "ESP32, LoRa, Firebase, React", team: "Team Alpha", year: 2025, approved: true },
        { id: "p2", title: "Fault Detection in Power Lines", description: "CNN-based image classification system for detecting faults in overhead transmission lines using drone imagery.", category: "AI / ML", tags: "Python, TensorFlow, OpenCV, Drones", team: "Team Visionary", year: 2026, approved: true },
        { id: "p3", title: "Autonomous Line-Following Robot", description: "PID-controlled autonomous robot with IR sensors, real-time path optimization, and obstacle avoidance capabilities.", category: "Embedded", tags: "Arduino, PID, IR Sensors, 3D Print", team: "Team Spark", year: 2025, approved: true },
        { id: "p4", title: "HEV Motor Controller", description: "Simulink simulation and RTOS controller development for a permanent magnet synchronous motor in Hybrid Electric Vehicles.", category: "Power Electronics", tags: "MATLAB, Simulink, CAN Bus, FreeRTOS", team: "Team Drive", year: 2026, approved: true },
        { id: "p5", title: "Solar-Powered Smart Irrigation", description: "Automated farm irrigation system powered by dual-axis solar tracking panels and monitored through a NodeMCU dashboard.", category: "Renewable Energy", tags: "Solar Tracking, NodeMCU, IoT, Blynk", team: "Team EcoPower", year: 2025, approved: true },
        { id: "p6", title: "Smart Home Energy Auditor", description: "Non-Intrusive Load Monitoring (NILM) tool mapping household power utilization using current sensors and Raspberry Pi.", category: "IoT", tags: "Raspberry Pi, Python, InfluxDB, Grafana", team: "Team WattSaver", year: 2026, approved: true },
        { id: "p7", title: "Resonant Wireless Charger", description: "Wireless charging system transmitting energy over high-frequency magnetic resonance fields for medical implants and EVs.", category: "Wireless", tags: "Resonant Coupling, HF Inverter, Analog IC", team: "Team Hertz", year: 2025, approved: true },
        { id: "p8", title: "Pi Pico Digital Oscilloscope", description: "Low-cost 2-channel digital storage oscilloscope using Raspberry Pi Pico for data acquisition and Python GUI for visualization.", category: "Embedded", tags: "RPi Pico, ADC, Python, Matplotlib", team: "Team PicoScope", year: 2026, approved: true }
    ];

    const DEFAULT_EVENTS = [
        { id: "e1", title: "National Tech Fest", description: "Annual national-level technical symposium of EESA showcasing innovative model displays, paper presentations, and electronic design contests.", status: "upcoming", date: "June 15, 2026", location: "Department Block", time: "09:00 AM - 05:00 PM" },
        { id: "e2", title: "IoT & Smart Grids Workshop", description: "Hands-on workshop on connecting IoT sensor nodes to cloud networks and understanding automation protocols in smart grids.", status: "upcoming", date: "July 02, 2026", location: "Lab 3", time: "10:00 AM - 04:00 PM" },
        { id: "e3", title: "EESA Hackathon 2025", description: "A intense 24-hour hackathon focusing on electrical engineering challenges, energy storage devices, and microgrid controllers.", status: "past", date: "Dec 12, 2025", location: "Seminar Hall", time: "24 Hours" },
        { id: "e4", title: "Guest Lecture: Future of EVs", description: "Insightful guest lecture on next-generation electric drivetrains, power inverter topologies, and fast charging standards.", status: "past", date: "Nov 18, 2025", location: "Virtual/Zoom", time: "06:00 PM" }
    ];

    const DEFAULT_ALUMNI = [
        { id: "a1", name: "Saivarshith M.", role: "Software Engineering Lead", company: "Google", batch: "Class of 2020", initials: "SM", experience: "Leading developers at Google working on Cloud infrastructure and virtualization. Enjoys mentoring juniors and guiding technical workshops.", linkedin_url: "https://linkedin.com", github_url: "https://github.com/saivarshithm", email: "saivarshith@google.com" },
        { id: "a2", name: "Aditi Rao", role: "Power Systems Consultant", company: "Tesla", batch: "Class of 2018", initials: "AR", experience: "Consulting on grid integration of high-voltage battery storage systems and charging stations at Tesla. Specializes in renewable power systems.", linkedin_url: "https://linkedin.com", email: "aditi.rao@tesla.com" },
        { id: "a3", name: "Dr. Rohan Sharma", role: "Assistant Professor (EE)", company: "Stanford University", batch: "Class of 2014", initials: "RS", experience: "Researching modern power semiconductors and smart grid integration. Published 20+ papers in IEEE transactions.", linkedin_url: "https://linkedin.com", github_url: "https://github.com", email: "rohan@stanford.edu" },
        { id: "a4", name: "Vikram K. Sen", role: "Lead Research Engineer", company: "ABB Research", batch: "Class of 2016", initials: "VS", experience: "Conducting simulations on industrial motors, magnetic couplings, and switchgear technologies. Previously worked at GE Power.", linkedin_url: "https://linkedin.com" },
        { id: "a5", name: "Divya Nair", role: "Hardware Architect", company: "Intel Corporation", batch: "Class of 2021", initials: "DN", experience: "Designing high-speed digital circuit boards and system-on-chip packaging protocols. Avid hardware hacker and PCB designer.", linkedin_url: "https://linkedin.com", github_url: "https://github.com" },
        { id: "a6", name: "Siddharth Mehta", role: "Grid Automation Specialist", company: "Siemens Energy", batch: "Class of 2017", initials: "SM", experience: "Configuring supervisory control systems and modern grid routers. Focused on sustainable energy development.", linkedin_url: "https://linkedin.com" },
        { id: "a7", name: "Pooja Hegde", role: "PhD Scholar (Quantum Computing)", company: "MIT", batch: "Class of 2023", initials: "PH", experience: "Carrying out research on quantum algorithms, solid-state qubits, and cryo-electronics control interfaces.", linkedin_url: "https://linkedin.com", github_url: "https://github.com" },
        { id: "a8", name: "Karthik Prasad", role: "Director of Engineering", company: "NVIDIA", batch: "Class of 2012", initials: "KP", experience: "Directing the compiler design division for high-performance AI GPU cards. Loves teaching computer architecture.", linkedin_url: "https://linkedin.com", email: "karthik@nvidia.com" }
    ];

    // Helper functions for local storage data persistence (offline mode)
    const getLocalData = (key, defaultVal) => {
        const stored = localStorage.getItem(key);
        if (!stored) {
            localStorage.setItem(key, JSON.stringify(defaultVal));
            return defaultVal;
        }
        return JSON.parse(stored);
    };

    const saveLocalData = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    // ── 4. Load & Synchronize Datasets ──
    let projectsList = [];
    let eventsList = [];
    let alumniList = [];

    const loadAllData = async () => {
        if (isDbOnline && supabase) {
            try {
                // Fetch projects
                const { data: projs, error: pe } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
                if (pe) throw pe;
                projectsList = projs;

                // Fetch events
                const { data: evs, error: ee } = await supabase.from('events').select('*').order('created_at', { ascending: false });
                if (ee) throw ee;
                eventsList = evs;

                // Fetch alumni
                const { data: alums, error: ae } = await supabase.from('alumni').select('*').order('created_at', { ascending: false });
                if (ae) throw ae;
                alumniList = alums;

                // Check alumni role mapping after loading list
                if (loggedInEmail && loggedInEmail !== 'admin@eesanitk.in') {
                    const matchedAlum = alumniList.find(a => a.email && a.email.toLowerCase() === loggedInEmail.toLowerCase());
                    if (matchedAlum) {
                        isAlumni = true;
                        isStudent = false;
                        myAlumniId = matchedAlum.id;
                        document.body.classList.add('admin-active');
                    }
                }

                // Seed database if completely empty (authenticated session can seed)
                if (projectsList.length === 0 && eventsList.length === 0 && alumniList.length === 0 && isSuperAdmin) {
                    await seedDatabase();
                }
            } catch (err) {
                console.error("Supabase data fetch failed. Loading offline caches.", err);
                loadOfflineData();
                resolveOfflineAlumni();
            }
        } else {
            loadOfflineData();
            resolveOfflineAlumni();
        }
        renderNavbarAuthButton();
        renderGrids();
    };

    const resolveOfflineAlumni = () => {
        if (loggedInEmail && loggedInEmail !== 'admin@eesanitk.in') {
            const matchedAlum = alumniList.find(a => a.email && a.email.toLowerCase() === loggedInEmail.toLowerCase());
            if (matchedAlum) {
                isAlumni = true;
                isStudent = false;
                myAlumniId = matchedAlum.id;
                document.body.classList.add('admin-active');
            }
        }
    };

    const loadOfflineData = () => {
        projectsList = getLocalData('eesa_projects', DEFAULT_PROJECTS);
        eventsList = getLocalData('eesa_events', DEFAULT_EVENTS);
        alumniList = getLocalData('eesa_alumni', DEFAULT_ALUMNI);
    };

    const seedDatabase = async () => {
        console.log("Seeding empty database with default data...");
        try {
            await supabase.from('projects').insert(DEFAULT_PROJECTS.map(p => { const {id, ...rest} = p; return rest; }));
            await supabase.from('events').insert(DEFAULT_EVENTS.map(e => { const {id, ...rest} = e; return rest; }));
            await supabase.from('alumni').insert(DEFAULT_ALUMNI.map(a => { const {id, ...rest} = a; return rest; }));
            
            // Reload after seeding
            const { data: p } = await supabase.from('projects').select('*');
            projectsList = p || [];
            const { data: ev } = await supabase.from('events').select('*');
            eventsList = ev || [];
            const { data: al } = await supabase.from('alumni').select('*');
            alumniList = al || [];
        } catch (e) {
            console.error("DB Seed failed:", e);
        }
    };

    // ── 5. Render Grids Based on Document Element Targets ──
    const renderGrids = () => {
        // Find grid containers
        const indexEventsGrid = document.getElementById('events-grid');
        const indexProjectsGrid = document.getElementById('projects-grid');
        const projectsPageGrid = document.getElementById('projects-grid');
        const upcomingEventsGrid = document.getElementById('upcoming-events-grid');
        const pastEventsGrid = document.getElementById('past-events-grid');
        const alumniGrid = document.getElementById('alumni-grid');

        // Filter projects: Public & Student only see approved + student's own unapproved submissions.
        // SuperAdmin sees all.
        let displayedProjects = [];
        if (isSuperAdmin) {
            displayedProjects = projectsList;
        } else {
            displayedProjects = projectsList.filter(p => p.approved === true || p.approved === 'true' || (loggedInEmail && p.creator_email && p.creator_email.toLowerCase() === loggedInEmail.toLowerCase()));
        }

        // Home Page Rendering
        if (indexEventsGrid && (window.location.pathname.includes('index.html') || !window.location.pathname.includes('.html'))) {
            // Render 2 upcoming featured events
            const upcoming = eventsList.filter(e => e.status === 'upcoming').slice(0, 2);
            indexEventsGrid.innerHTML = upcoming.map(e => createEventCardHTML(e)).join('');
        }

        if (indexProjectsGrid && (window.location.pathname.includes('index.html') || !window.location.pathname.includes('.html'))) {
            // Render 3 featured projects
            const featured = displayedProjects.slice(0, 3);
            indexProjectsGrid.innerHTML = featured.map(p => createProjectCardHTML(p)).join('');
        }

        // Projects Page
        if (projectsPageGrid && window.location.pathname.includes('projects.html')) {
            projectsPageGrid.innerHTML = displayedProjects.length > 0 ? displayedProjects.map(p => createProjectCardHTML(p)).join('') : '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">No projects submitted yet.</p>';
        }

        // Events Page
        if (upcomingEventsGrid && pastEventsGrid && window.location.pathname.includes('events.html')) {
            const upcoming = eventsList.filter(e => e.status === 'upcoming');
            const past = eventsList.filter(e => e.status === 'past');
            
            upcomingEventsGrid.innerHTML = upcoming.length > 0 ? upcoming.map(e => createEventCardHTML(e)).join('') : '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">No upcoming events scheduled.</p>';
            pastEventsGrid.innerHTML = past.length > 0 ? past.map(e => createEventCardHTML(e)).join('') : '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">No history logs.</p>';
        }

        // Alumni Page
        if (alumniGrid && window.location.pathname.includes('alumni.html')) {
            alumniGrid.innerHTML = alumniList.map(a => createAlumniCardHTML(a)).join('');
            setupAlumniMobileClicks();
        }

        // Re-attach scroll animations for new elements
        runScrollReveal();
    };

    // ── 6. HTML Card Creators ──
    const createProjectCardHTML = (p) => {
        const tagsArr = typeof p.tags === 'string' ? p.tags.split(',').map(t => t.trim()) : (Array.isArray(p.tags) ? p.tags : []);
        const isApproved = p.approved === true || p.approved === 'true';
        
        let badgeHTML = '';
        if (isSuperAdmin || (loggedInEmail && p.creator_email && p.creator_email.toLowerCase() === loggedInEmail.toLowerCase())) {
            badgeHTML = isApproved 
                ? `<span class="badge-approved">Approved</span>`
                : `<span class="badge-pending">Pending Approval</span>`;
        }

        let approveActionHTML = '';
        if (isSuperAdmin && !isApproved) {
            approveActionHTML = `
                <button class="btn-card-action approve" onclick="window.approveProject('${p.id}')" title="Approve Project">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </button>
            `;
        }

        return `
            <div class="card reveal" data-id="${p.id}">
                ${isSuperAdmin ? `
                    <div class="admin-actions">
                        ${approveActionHTML}
                        <button class="btn-card-action edit" onclick="window.editProject('${p.id}')" title="Edit Card">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                        <button class="btn-card-action delete" onclick="window.deleteProject('${p.id}')" title="Delete Card">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                ` : ''}
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <span class="card-tag">${p.category}</span>
                        ${badgeHTML}
                    </div>
                    <h3 class="card-title">${p.title}</h3>
                    <p class="card-desc">${p.description}</p>
                    <div class="project-tags">
                        ${tagsArr.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="card-meta">
                        <span class="card-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            ${p.team}
                        </span>
                        <span class="card-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            ${p.year}
                        </span>
                    </div>
                </div>
            </div>
        `;
    };

    const createEventCardHTML = (e) => {
        return `
            <div class="card event-card reveal" data-id="${e.id}">
                ${isSuperAdmin ? `
                    <div class="admin-actions">
                        <button class="btn-card-action edit" onclick="window.editEvent('${e.id}')" title="Edit Card">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                        <button class="btn-card-action delete" onclick="window.deleteEvent('${e.id}')" title="Delete Card">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                ` : ''}
                <div class="card-body">
                    <div class="event-card-header">
                        <span class="event-status ${e.status}">${e.status === 'upcoming' ? 'Upcoming' : 'Past'}</span>
                        <span class="event-date">${e.date}</span>
                    </div>
                    <h3 class="card-title">${e.title}</h3>
                    <p class="card-desc">${e.description}</p>
                    <div class="card-meta" style="margin-top: 20px;">
                        <span class="card-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${e.location}
                        </span>
                        <span class="card-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            ${e.time}
                        </span>
                    </div>
                </div>
            </div>
        `;
    };

    const createAlumniCardHTML = (a) => {
        const initials = a.initials || (a.name ? a.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'AL');
        
        return `
            <div class="alumni-card reveal" data-id="${a.id}">
                ${isSuperAdmin || (isAlumni && a.id === myAlumniId) ? `
                    <div class="admin-actions">
                        <button class="btn-card-action edit" onclick="window.editAlumni('${a.id}')" title="Edit Profile" style="z-index: 10;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                        ${isSuperAdmin ? `
                        <button class="btn-card-action delete" onclick="window.deleteAlumni('${a.id}')" title="Delete Profile" style="z-index: 10;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                        ` : ''}
                    </div>
                ` : ''}
                <div class="alumni-avatar">${initials}</div>
                <h3>${a.name}</h3>
                <div class="alumni-role">${a.role}</div>
                <div class="alumni-company">${a.company}</div>
                <div class="alumni-batch">${a.batch}</div>
                
                <!-- Experience overlay container -->
                <div class="alumni-experience-overlay">
                    <div>
                        <div class="alumni-exp-header">Biography / Experience</div>
                        <p class="alumni-exp-text">${a.experience || 'No detailed professional experience added yet.'}</p>
                    </div>
                    <div class="alumni-socials">
                        ${a.linkedin_url ? `<a href="${a.linkedin_url}" target="_blank" class="alumni-social-icon" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg></a>` : ''}
                        ${a.github_url ? `<a href="${a.github_url}" target="_blank" class="alumni-social-icon" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg></a>` : ''}
                        ${a.twitter_url ? `<a href="${a.twitter_url}" target="_blank" class="alumni-social-icon" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>` : ''}
                        ${a.email ? `<a href="mailto:${a.email}" class="alumni-social-icon" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg></a>` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    // Mobile click compatibility for alumni cards (toggle experience overlay)
    const setupAlumniMobileClicks = () => {
        const cards = document.querySelectorAll('.alumni-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Ignore if clicked on admin action buttons or social links
                if (e.target.closest('.admin-actions') || e.target.closest('.alumni-social-icon')) {
                    return;
                }
                
                // Toggle active class
                const isOpened = card.classList.contains('show-overlay');
                // Close all others first
                cards.forEach(c => c.classList.remove('show-overlay'));
                if (!isOpened) {
                    card.classList.add('show-overlay');
                }
            });
        });
    };

    // ── 7. Administrative Banner and Actions Panel ──
    const injectAdminUI = () => {
        if (!isSuperAdmin && !isAlumni && !isStudent) return;

        // Check active grids on page to display context specific add actions
        const hasProjects = !!document.getElementById('projects-grid');
        const hasEvents = !!document.getElementById('upcoming-events-grid') || !!document.getElementById('events-grid');
        const hasAlumni = !!document.getElementById('alumni-grid');

        // Clean up existing admin bar
        const existingBar = document.querySelector('.admin-panel-bar');
        if (existingBar) existingBar.remove();

        const adminBar = document.createElement('div');
        adminBar.className = 'admin-panel-bar';
        
        if (isSuperAdmin) {
            adminBar.innerHTML = `
                <div class="admin-panel-info">
                    <span class="dot"></span>
                    <span>EESA NITK Admin Panel</span>
                </div>
                <div class="admin-panel-actions">
                    ${hasProjects ? `<button class="btn-admin-header" id="btnAdminAddProj"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align: middle;"><path d="M5 12h14M12 5v14"/></svg> Add Project</button>` : ''}
                    ${hasEvents ? `<button class="btn-admin-header" id="btnAdminAddEvent"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align: middle;"><path d="M5 12h14M12 5v14"/></svg> Add Event</button>` : ''}
                    ${hasAlumni ? `<button class="btn-admin-header" id="btnAdminAddAlumni"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align: middle;"><path d="M5 12h14M12 5v14"/></svg> Add Alumni</button>` : ''}
                    <button class="btn-admin-header logout" id="btnAdminLogout">Log Out</button>
                </div>
            `;
        } else if (isAlumni) {
            const myProfile = alumniList.find(a => a.email && a.email.toLowerCase() === loggedInEmail.toLowerCase());
            if (myProfile) {
                myAlumniId = myProfile.id;
                adminBar.innerHTML = `
                    <div class="admin-panel-info">
                        <span class="dot" style="background-color: var(--teal-light);"></span>
                        <span>EESA Alumni Portal: Welcome, <strong>${myProfile.name}</strong></span>
                    </div>
                    <div class="admin-panel-actions">
                        <button class="btn-admin-header" id="btnAlumniEditSelf"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> Edit My Profile</button>
                        <button class="btn-admin-header logout" id="btnAdminLogout">Log Out</button>
                    </div>
                `;
            } else {
                adminBar.innerHTML = `
                    <div class="admin-panel-info">
                        <span class="dot" style="background-color: var(--teal-light);"></span>
                        <span>EESA Alumni Portal: Welcome, <strong>${loggedInEmail}</strong></span>
                    </div>
                    <div class="admin-panel-actions">
                        <button class="btn-admin-header" id="btnAlumniCreateSelf"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align: middle;"><path d="M5 12h14M12 5v14"/></svg> Add Alumni Profile</button>
                        <button class="btn-admin-header logout" id="btnAdminLogout">Log Out</button>
                    </div>
                `;
            }
        } else if (isStudent) {
            adminBar.innerHTML = `
                <div class="admin-panel-info">
                    <span class="dot" style="background-color: var(--lime);"></span>
                    <span>EESA Student Portal: Welcome, <strong>${loggedInEmail}</strong></span>
                </div>
                <div class="admin-panel-actions">
                    ${hasProjects ? `<button class="btn-admin-header" id="btnStudentAddProj"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align: middle;"><path d="M5 12h14M12 5v14"/></svg> Submit a Project</button>` : ''}
                    <button class="btn-admin-header logout" id="btnAdminLogout">Log Out</button>
                </div>
            `;
        }
        
        document.body.appendChild(adminBar);

        // Bind banner actions
        if (isSuperAdmin) {
            const btnAddProj = document.getElementById('btnAdminAddProj');
            if (btnAddProj) btnAddProj.addEventListener('click', () => openProjectModal());

            const btnAddEvent = document.getElementById('btnAdminAddEvent');
            if (btnAddEvent) btnAddEvent.addEventListener('click', () => openEventModal());

            const btnAddAlumni = document.getElementById('btnAdminAddAlumni');
            if (btnAddAlumni) btnAddAlumni.addEventListener('click', () => openAlumniModal());
        } else if (isAlumni) {
            const btnEditSelf = document.getElementById('btnAlumniEditSelf');
            if (btnEditSelf) btnEditSelf.addEventListener('click', () => window.editAlumni(myAlumniId));

            const btnCreateSelf = document.getElementById('btnAlumniCreateSelf');
            if (btnCreateSelf) btnCreateSelf.addEventListener('click', () => openAlumniModal());
        } else if (isStudent) {
            const btnStudentAddProj = document.getElementById('btnStudentAddProj');
            if (btnStudentAddProj) btnStudentAddProj.addEventListener('click', () => openProjectModal());
        }

        const logoutBtn = document.getElementById('btnAdminLogout');
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    };

    // ── 8. Form Modals Structure Injections ──
    const injectModalContainers = () => {
        if (!isSuperAdmin && !isAlumni && !isStudent) return;

        const existingModal = document.getElementById('adminModal');
        if (existingModal) existingModal.remove();

        const modalDiv = document.createElement('div');
        modalDiv.className = 'admin-modal';
        modalDiv.id = 'adminModal';
        modalDiv.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h3 class="admin-modal-title" id="modalTitle">Form Header</h3>
                    <button class="admin-modal-close" id="btnModalClose">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <form id="adminForm">
                    <input type="hidden" id="formActionType">
                    <input type="hidden" id="formTargetId">
                    <div id="modalFormFields"></div>
                    <div class="modal-actions">
                        <button type="button" class="btn-modal-cancel" id="btnModalCancel">Cancel</button>
                        <button type="submit" class="btn-modal-save" id="btnModalSave">Save Changes</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modalDiv);

        // Bind generic modal close handlers
        const closeModal = () => modalDiv.classList.remove('open');
        document.getElementById('btnModalClose').addEventListener('click', closeModal);
        document.getElementById('btnModalCancel').addEventListener('click', closeModal);

        // Form submission wiring
        document.getElementById('adminForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const actionType = document.getElementById('formActionType').value;
            const targetId = document.getElementById('formTargetId').value;

            if (actionType === 'project') {
                await handleProjectSubmit(targetId);
            } else if (actionType === 'event') {
                await handleEventSubmit(targetId);
            } else if (actionType === 'alumni') {
                await handleAlumniSubmit(targetId);
            }
            closeModal();
            loadAllData(); // Refresh UI
        });
    };

    // ── 9. Project Modal Operations ──
    window.editProject = (id) => {
        const p = projectsList.find(item => item.id === id);
        if (p) openProjectModal(p);
    };

    window.approveProject = async (id) => {
        if (!confirm("Are you sure you want to approve this project?")) return;

        if (isDbOnline && supabase) {
            try {
                const { error } = await supabase.from('projects').update({ approved: true }).eq('id', id);
                if (error) throw error;
            } catch (err) {
                console.error("DB Project approval failed:", err);
                alert("Failed to approve project: " + err.message);
                return;
            }
        } else {
            let items = getLocalData('eesa_projects', DEFAULT_PROJECTS);
            items = items.map(item => item.id === id ? { ...item, approved: true } : item);
            saveLocalData('eesa_projects', items);
        }
        await loadAllData();
    };

    const openProjectModal = (p = null) => {
        const modal = document.getElementById('adminModal');
        const title = document.getElementById('modalTitle');
        const fields = document.getElementById('modalFormFields');
        const typeInput = document.getElementById('formActionType');
        const idInput = document.getElementById('formTargetId');

        typeInput.value = 'project';
        idInput.value = p ? p.id : '';
        title.textContent = p ? 'Edit Project Details' : (isStudent ? 'Submit Your Innovation Project' : 'Add New Innovation Project');

        fields.innerHTML = `
            <div class="form-group">
                <label class="form-label" for="projTitle">Project Title</label>
                <input class="form-input" type="text" id="projTitle" required placeholder="e.g. Smart Energy Router" value="${p ? p.title : ''}">
            </div>
            <div class="form-group">
                <label class="form-label" for="projDesc">Brief Description</label>
                <textarea class="form-input" id="projDesc" rows="3" required placeholder="Describe the project goal and components..." style="resize:vertical;">${p ? p.description : ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="projCat">Category</label>
                    <input class="form-input" type="text" id="projCat" required placeholder="e.g. Hardware, AI / ML" value="${p ? p.category : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="projYear">Year</label>
                    <input class="form-input" type="number" id="projYear" required placeholder="2026" value="${p ? p.year : new Date().getFullYear()}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="projTeam">Team Name / Members</label>
                    <input class="form-input" type="text" id="projTeam" required placeholder="e.g. Team Volt" value="${p ? p.team : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="projTags">Technologies / Tags</label>
                    <input class="form-input" type="text" id="projTags" placeholder="e.g. ESP32, Python, LoRa (comma-separated)" value="${p ? p.tags : ''}">
                </div>
            </div>
        `;
        modal.classList.add('open');
    };

    const handleProjectSubmit = async (id) => {
        const payload = {
            title: document.getElementById('projTitle').value.trim(),
            description: document.getElementById('projDesc').value.trim(),
            category: document.getElementById('projCat').value.trim(),
            year: parseInt(document.getElementById('projYear').value),
            team: document.getElementById('projTeam').value.trim(),
            tags: document.getElementById('projTags').value.trim()
        };

        if (!id) {
            payload.approved = isSuperAdmin ? true : false;
            payload.creator_email = loggedInEmail;
        }

        if (isDbOnline && supabase) {
            try {
                if (id) {
                    await supabase.from('projects').update(payload).eq('id', id);
                } else {
                    await supabase.from('projects').insert(payload);
                }
            } catch (err) {
                console.error("DB Project save failed:", err);
            }
        } else {
            // Local preview persistence
            let items = getLocalData('eesa_projects', DEFAULT_PROJECTS);
            if (id) {
                items = items.map(item => item.id === id ? { ...item, ...payload } : item);
            } else {
                payload.id = 'p_' + Math.random().toString(36).substring(2, 9);
                items.unshift(payload);
            }
            saveLocalData('eesa_projects', items);
        }
    };

    window.deleteProject = async (id) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        if (isDbOnline && supabase) {
            try {
                await supabase.from('projects').delete().eq('id', id);
            } catch (e) {
                console.error("DB Project delete failed:", e);
            }
        } else {
            let items = getLocalData('eesa_projects', DEFAULT_PROJECTS);
            items = items.filter(item => item.id !== id);
            saveLocalData('eesa_projects', items);
        }
        loadAllData();
    };

    // ── 10. Event Modal Operations ──
    window.editEvent = (id) => {
        const e = eventsList.find(item => item.id === id);
        if (e) openEventModal(e);
    };

    const openEventModal = (e = null) => {
        const modal = document.getElementById('adminModal');
        const title = document.getElementById('modalTitle');
        const fields = document.getElementById('modalFormFields');
        const typeInput = document.getElementById('formActionType');
        const idInput = document.getElementById('formTargetId');

        typeInput.value = 'event';
        idInput.value = e ? e.id : '';
        title.textContent = e ? 'Edit Event Details' : 'Add New Event';

        fields.innerHTML = `
            <div class="form-group">
                <label class="form-label" for="eventTitle">Event Title</label>
                <input class="form-input" type="text" id="eventTitle" required placeholder="e.g. Industrial Automation Seminar" value="${e ? e.title : ''}">
            </div>
            <div class="form-group">
                <label class="form-label" for="eventDesc">Detailed Description</label>
                <textarea class="form-input" id="eventDesc" rows="3" required placeholder="Provide detail regarding dates, highlights..." style="resize:vertical;">${e ? e.description : ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="eventStatus">Status</label>
                    <select class="form-input" id="eventStatus" required style="background-color: var(--bg);">
                        <option value="upcoming" ${e && e.status === 'upcoming' ? 'selected' : ''}>Upcoming</option>
                        <option value="past" ${e && e.status === 'past' ? 'selected' : ''}>Past</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="eventDate">Date String</label>
                    <input class="form-input" type="text" id="eventDate" required placeholder="e.g. October 12, 2026" value="${e ? e.date : ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="eventLocation">Location</label>
                    <input class="form-input" type="text" id="eventLocation" required placeholder="e.g. LHC / Virtual/Zoom" value="${e ? e.location : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="eventTime">Time Range</label>
                    <input class="form-input" type="text" id="eventTime" required placeholder="e.g. 02:00 PM - 05:00 PM" value="${e ? e.time : ''}">
                </div>
            </div>
        `;
        modal.classList.add('open');
    };

    const handleEventSubmit = async (id) => {
        const payload = {
            title: document.getElementById('eventTitle').value.trim(),
            description: document.getElementById('eventDesc').value.trim(),
            status: document.getElementById('eventStatus').value,
            date: document.getElementById('eventDate').value.trim(),
            location: document.getElementById('eventLocation').value.trim(),
            time: document.getElementById('eventTime').value.trim()
        };

        if (isDbOnline && supabase) {
            try {
                if (id) {
                    await supabase.from('events').update(payload).eq('id', id);
                } else {
                    await supabase.from('events').insert(payload);
                }
            } catch (err) {
                console.error("DB Event save failed:", err);
            }
        } else {
            let items = getLocalData('eesa_events', DEFAULT_EVENTS);
            if (id) {
                items = items.map(item => item.id === id ? { ...item, ...payload } : item);
            } else {
                payload.id = 'e_' + Math.random().toString(36).substring(2, 9);
                items.unshift(payload);
            }
            saveLocalData('eesa_events', items);
        }
    };

    window.deleteEvent = async (id) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        if (isDbOnline && supabase) {
            try {
                await supabase.from('events').delete().eq('id', id);
            } catch (e) {
                console.error("DB Event delete failed:", e);
            }
        } else {
            let items = getLocalData('eesa_events', DEFAULT_EVENTS);
            items = items.filter(item => item.id !== id);
            saveLocalData('eesa_events', items);
        }
        loadAllData();
    };

    // ── 11. Alumni Modal Operations ──
    window.editAlumni = (id) => {
        const a = alumniList.find(item => item.id === id);
        if (a) openAlumniModal(a);
    };

    const openAlumniModal = (a = null) => {
        const modal = document.getElementById('adminModal');
        const title = document.getElementById('modalTitle');
        const fields = document.getElementById('modalFormFields');
        const typeInput = document.getElementById('formActionType');
        const idInput = document.getElementById('formTargetId');

        typeInput.value = 'alumni';
        idInput.value = a ? a.id : '';
        title.textContent = a ? 'Edit Alumni Profile' : 'Register New Alumni Profile';

        fields.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="alName">Full Name</label>
                    <input class="form-input" type="text" id="alName" required placeholder="e.g. Ramesh Hegde" value="${a ? a.name : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="alInitials">Initials</label>
                    <input class="form-input" type="text" id="alInitials" placeholder="e.g. RH" maxlength="3" value="${a ? (a.initials || '') : ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="alRole">Job Title / Role</label>
                    <input class="form-input" type="text" id="alRole" required placeholder="e.g. CEO / Senior Architect" value="${a ? a.role : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="alCompany">Organization / Company</label>
                    <input class="form-input" type="text" id="alCompany" required placeholder="e.g. Microsoft / Intel" value="${a ? a.company : ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="alBatch">Graduation Batch</label>
                    <input class="form-input" type="text" id="alBatch" required placeholder="e.g. Class of 2019" value="${a ? a.batch : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="alEmail">Contact Email</label>
                    <input class="form-input" type="email" id="alEmail" placeholder="e.g. name@domain.com" value="${a ? (a.email || '') : ''}" ${(!isSuperAdmin && isAlumni) ? 'readonly style="opacity: 0.7; cursor: not-allowed;" title="Email cannot be changed by alumni to maintain login verification."' : ''}>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="alExp">Biography &amp; Professional Experience</label>
                <textarea class="form-input" id="alExp" rows="4" placeholder="Briefly describe your journey, work accomplishments, and tips for juniors..." style="resize:vertical;">${a ? (a.experience || '') : ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="alLinkedin">LinkedIn URL</label>
                    <input class="form-input" type="url" id="alLinkedin" placeholder="https://linkedin.com/in/username" value="${a ? (a.linkedin_url || '') : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="alGithub">GitHub URL</label>
                    <input class="form-input" type="url" id="alGithub" placeholder="https://github.com/username" value="${a ? (a.github_url || '') : ''}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="alTwitter">Twitter / X URL</label>
                <input class="form-input" type="url" id="alTwitter" placeholder="https://twitter.com/username" value="${a ? (a.twitter_url || '') : ''}">
            </div>
        `;
        modal.classList.add('open');
    };

    const handleAlumniSubmit = async (id) => {
        const payload = {
            name: document.getElementById('alName').value.trim(),
            initials: document.getElementById('alInitials').value.trim().toUpperCase() || document.getElementById('alName').value.trim().substring(0,2).toUpperCase(),
            role: document.getElementById('alRole').value.trim(),
            company: document.getElementById('alCompany').value.trim(),
            batch: document.getElementById('alBatch').value.trim(),
            experience: document.getElementById('alExp').value.trim(),
            linkedin_url: document.getElementById('alLinkedin').value.trim() || null,
            github_url: document.getElementById('alGithub').value.trim() || null,
            twitter_url: document.getElementById('alTwitter').value.trim() || null,
            email: document.getElementById('alEmail').value.trim() || null
        };

        if (isDbOnline && supabase) {
            try {
                if (id) {
                    await supabase.from('alumni').update(payload).eq('id', id);
                } else {
                    await supabase.from('alumni').insert(payload);
                }
            } catch (err) {
                console.error("DB Alumni save failed:", err);
            }
        } else {
            let items = getLocalData('eesa_alumni', DEFAULT_ALUMNI);
            if (id) {
                items = items.map(item => item.id === id ? { ...item, ...payload } : item);
            } else {
                payload.id = 'a_' + Math.random().toString(36).substring(2, 9);
                items.unshift(payload);
            }
            saveLocalData('eesa_alumni', items);
        }
    };

    window.deleteAlumni = async (id) => {
        if (!confirm("Are you sure you want to remove this alumni profile?")) return;

        if (isDbOnline && supabase) {
            try {
                await supabase.from('alumni').delete().eq('id', id);
            } catch (e) {
                console.error("DB Alumni delete failed:", e);
            }
        } else {
            let items = getLocalData('eesa_alumni', DEFAULT_ALUMNI);
            items = items.filter(item => item.id !== id);
            saveLocalData('eesa_alumni', items);
        }
        loadAllData();
    };

    // ── 12. Load Initial Data and Inject UIs ──
    await loadAllData();
    injectAdminUI();
    injectModalContainers();


    // ── 13. UI Layout Interactivity (Navbar & Transitions) ──
    
    // Navbar Scroll Shadow Effect
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Mobile Menu Toggle
    const navToggle = document.getElementById('navToggle');
    const navMobile = document.getElementById('navMobile');

    if (navToggle && navMobile) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMobile.classList.contains('open');
            if (isOpen) {
                navToggle.classList.remove('active');
                navMobile.classList.remove('open');
                document.body.style.overflow = '';
            } else {
                navToggle.classList.add('active');
                navMobile.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });

        // Close menu when mobile links are clicked
        const mobileLinks = navMobile.querySelectorAll('.nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMobile.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // Scroll Reveal Observer
    function runScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        if (revealElements.length > 0) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.05,
                rootMargin: '0px 0px -20px 0px'
            });

            revealElements.forEach(el => {
                revealObserver.observe(el);
            });
        }
    }
    runScrollReveal();
});
