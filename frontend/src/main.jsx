import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, ArrowLeft, ArrowUpRight, BarChart3, CheckCircle2, ChevronDown, ChevronRight, FileText, Flame, Gauge, LockKeyhole, MapPin, ShieldCheck, Siren, Sparkles, Target, Upload } from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

const sampleReports = [
  'Contractor was working on an energized MCC panel at Duliajan without verifying isolation. No LOTO tag observed. Near miss.',
  'Welding contractor commenced hot work on a crude oil transfer line at Moran without a hot work permit. Gas test not performed.',
  'Worker entered a crude oil tank at Jorhat without atmospheric testing or a standby person. Confined space permit not issued.'
];

const sites = [
  { name: 'Duliajan', region: 'Upper Assam', reports: 682, sif: 218, rule: 'Energy Isolation', tone: 'amber' },
  { name: 'Moran', region: 'Upper Assam', reports: 514, sif: 176, rule: 'Hot Work', tone: 'red' },
  { name: 'Rajasthan', region: 'Western Onshore', reports: 498, sif: 164, rule: 'Bypassing Safety Controls', tone: 'red' },
  { name: 'Jorhat', region: 'Upper Assam', reports: 421, sif: 121, rule: 'Confined Space', tone: 'blue' }
];

const rules = [
  ['Energy Isolation', 31, 'Live equipment, pressure and LOTO failures'],
  ['Hot Work', 22, 'Ignition sources and permit failures'],
  ['Line of Fire', 18, 'Struck-by, caught-between and dropped objects'],
  ['Confined Space', 14, 'Atmospheric exposure and entry controls'],
  ['Working at Height', 9, 'Fall protection and dropped objects'],
  ['Driving', 6, 'Vehicle movement and journey management']
];

const activities = [
  ['Electrical maintenance', 82, 'Energy Isolation'],
  ['Pipeline maintenance', 71, 'Hot Work'],
  ['Drilling operations', 64, 'Line of Fire'],
  ['Tank inspection', 53, 'Confined Space']
];

const navGroups = {
  'Who We Are': ['Oil at a glance', 'Leadership', 'Our presence', 'Vision & values'],
  'What We Do': ['Upstream', 'Midstream', 'Downstream', 'Alternate energy'],
  Investors: ['Financial information', 'Shareholder information', 'Annual reports'],
  'OIL for All': ['Career at OIL', 'Community Engagement', 'Flagship Programmes', 'Ex-Employee'],
  Vigilance: ['Vigilance awareness', 'Integrity pact', 'Whistle blower policy', "Officer's Public Information"],
  'For Vendors': ['Vendor registration', 'Tenders', 'Supplier information'],
  Media: ['News and updates', 'Press releases', 'Publications'],
  'SIF Intelligence': ['How It Works', 'Analyze a Report', 'Risk Dashboard', 'Life-Saving Rules']
};

const roleProfiles = {
  safety_officer: { label: 'Safety Officer', scope: 'Triage & intervention', sites: 'All operating sites', sections: ['overview', 'analyzer', 'sites', 'rules', 'info'], color: 'blue' },
  statutory_reviewer: { label: 'Statutory Reviewer', scope: 'Directorate oversight', sites: 'All OIL operations', sections: ['overview', 'analyzer', 'sites', 'rules', 'governance', 'info'], color: 'red' },
  field_engineer: { label: 'Field Engineer', scope: 'Assigned field operations', sites: 'Duliajan field', sections: ['overview', 'analyzer', 'sites', 'rules', 'info'], color: 'amber' }
};

const menuContent = {
  'Oil at a glance': ['ABOUT OIL INDIA LIMITED', 'ENERGY. EXPERIENCE. RESPONSIBILITY.', 'An integrated energy company with operations spanning exploration, production, transportation and downstream capabilities.', ['Verified OIL statistic', 'Verified OIL statistic', 'Safety-first operating culture'], ['Oil India Limited has a strong heritage in exploration and production of crude oil and natural gas.', 'Complex energy operations generate observations, unsafe-act reports, unsafe-condition reports and near misses.', 'The SIF Precursor Intelligence System transforms those observations into prioritised safety intelligence.']],
  'Vision & values': ['CORPORATE PHILOSOPHY', 'Energy security with responsibility', 'A modern view of OIL’s corporate context: dependable energy, responsible operations and continuous learning for a changing energy landscape.', ['Energy security', 'Sustainability', 'Innovation'], ['Legacy and knowledge guide long-term decisions.', 'Integrity and commitment strengthen trust with stakeholders.', 'Safety and excellence connect every operation to earlier intervention.']],
  Leadership: ['CORPORATE GOVERNANCE', 'Leadership and accountability', 'The SPIS workspace supports accountable decision-making by giving leadership a consistent view of exposure, barriers and corrective action.', ['Directorate oversight', 'Site-level ownership', 'Evidence-led review'], ['Safety performance is reviewed through common SIF-potential indicators.', 'Escalation paths connect field observations with statutory and corporate review.', 'Role-based access keeps operational data relevant to each user.']],
  'Our presence': ['OPERATING FOOTPRINT', 'Where OIL operates', 'Explore the prototype operating footprint and the precursor density signals currently prioritised for intervention.', ['Duliajan · Upper Assam', 'Moran · Upper Assam', 'Rajasthan · Western Onshore'], ['Site rankings combine report volume, SIF-potential and leading Life-Saving Rule signals.', 'Location data is representative demo data, not a live asset register.', 'Use Analytics for the detailed site and activity ranking.']],
  Upstream: ['EXPLORATION & PRODUCTION', 'Upstream safety intelligence', 'Upstream activities expose teams to energy isolation, line-of-fire, lifting and process hazards that SPIS helps surface early.', ['Drilling operations', 'Well services', 'Production facilities'], ['Narratives are classified for SIF potential before monthly or quarterly review.', 'Leading barriers and Life-Saving Rules are shown alongside site context.', 'Open Analytics to compare upstream activity signals.']],
  Midstream: ['TRANSPORT & STORAGE', 'Midstream safety intelligence', 'Pipeline, tank and transfer activities are organised around permit quality, isolation and confined-space controls.', ['Pipeline maintenance', 'Tank inspection', 'Product transfer'], ['Hot work and energy isolation remain key precursor themes in the demonstration data.', 'Reports can be searched by site, activity and barrier failure.', 'Use the Analyzer to test a new near-miss narrative.']],
  Downstream: ['PROCESS OPERATIONS', 'Downstream safety intelligence', 'Process operations require visible barriers and disciplined authorisation. SPIS highlights where those controls may be at risk.', ['Process units', 'Maintenance windows', 'Loading and dispatch'], ['The system flags high-energy exposures even when the reported outcome is low severity.', 'Rule tags provide a common intervention language for HSE teams.', 'Synthetic examples are used for this hackathon prototype.']],
  'Alternate energy': ['ENERGY TRANSITION', 'Alternate energy and safe growth', 'OIL’s safety intelligence approach can extend to new energy projects, contractors and emerging operational risks.', ['New energy projects', 'Contractor assurance', 'Technology pilots'], ['The same SIF precursor method can be adapted as new hazards and controls are defined.', 'Role-based workflows support project, field and reviewer teams.', 'Use Reports to validate narrative classification.']],
  'Financial information': ['INVESTOR INFORMATION', 'Performance with safety in view', 'This prototype presents HSSE intelligence as an operational performance signal, supporting transparent and responsible decision-making.', ['Operational indicators', 'Risk trend visibility', 'Action prioritisation'], ['Financial and statutory information is not connected to this demonstration dashboard.', 'The page explains how safety intelligence can complement corporate reporting.', 'Refer to OIL’s official website for published investor information.']],
  'Shareholder information': ['INVESTOR INFORMATION', 'Shareholder information', 'A clear safety picture supports trust with stakeholders, partners and the communities around OIL operations.', ['Governance visibility', 'Responsible operations', 'Public accountability'], ['SPIS is an internal-style prototype for SIH demonstration.', 'No personal, shareholder or financial records are stored in this demo.', 'Official disclosures remain available on the OIL corporate website.']],
  'Annual reports': ['REPORTING', 'Annual HSSE reporting view', 'Bring recurring precursor patterns into a consistent reporting rhythm for leadership and statutory review.', ['Trend snapshots', 'Rule distribution', 'Site comparisons'], ['The dashboard can produce a common narrative from free-text observations.', 'SIF-potential is kept separate from outcome severity for better prioritisation.', 'Use Statutory Review for the prototype compliance queue.']],
  'Career at OIL': ['OIL FOR ALL', 'Careers and safe work', 'A strong safety culture depends on people who are trained, empowered and able to stop unsafe work.', ['Competence', 'Speak-up culture', 'Field readiness'], ['SPIS supports learning by turning recurring barriers into targeted interventions.', 'The prototype does not collect candidate or employee data.', 'Explore the dashboard to see how reports become action.']],
  'Community Engagement': ['OIL FOR ALL', 'Community engagement', 'Safer operations protect employees, communities and the environment around every OIL location.', ['Community trust', 'Environmental care', 'Responsible operations'], ['Near-miss learning helps prevent events that could affect surrounding communities.', 'Location context is displayed at an aggregated site level.', 'All demonstration records are synthetic.']],
  'Flagship Programmes': ['OIL FOR ALL', 'Flagship safety programmes', 'SPIS complements existing HSE programmes by making high-energy precursor patterns visible between formal review cycles.', ['Zero harm', 'Barrier health', 'Learning teams'], ['Life-Saving Rules create a consistent language across sites.', 'Analytics highlights activity clusters requiring leadership attention.', 'Reports supports rapid triage of new observations.']],
  'Ex-Employee': ['OIL FOR ALL', 'Ex-employee information', 'OIL’s knowledge continues through its people. This prototype keeps operational access separate from personal records.', ['Knowledge transfer', 'Respect for privacy', 'Institutional learning'], ['No ex-employee data is included in the prototype.', 'This informational page is provided to make the navigation complete.', 'Return to Dashboard to view operational demo data.']],
  'Vigilance awareness': ['VIGILANCE', 'Vigilance and integrity', 'Transparent, traceable review helps ensure that safety observations receive appropriate attention and escalation.', ['Traceable actions', 'Independent review', 'Speak-up channels'], ['Statutory Reviewer access includes a governance queue and compliance summary.', 'This dashboard does not replace OIL’s official vigilance channels.', 'Use the official OIL website for formal complaints and policies.']],
  'Integrity pact': ['VIGILANCE', 'Integrity pact', 'Integrity in procurement and operations strengthens the barriers that protect people from serious harm.', ['Fair procurement', 'Control assurance', 'Audit trail'], ['Vendor and contractor controls can be reflected in precursor analysis.', 'The prototype separates demo analytics from formal procurement systems.', 'No supplier submissions are processed here.']],
  'Whistle blower policy': ['VIGILANCE', 'Whistle blower policy', 'A trusted speak-up culture allows hazards and control failures to be raised before they become serious events.', ['Confidentiality', 'Non-retaliation', 'Escalation'], ['SPIS is designed for safety observations, not confidential whistle-blower submissions.', 'Do not enter personal or sensitive information into the demo analyzer.', 'Use official OIL channels for formal reporting.']],
  "Officer's Public Information": ['PUBLIC INTEREST INFORMATION', "Officer's Public Information", "The Officer's Public Information page provides citizens with clear, aggregated information about OIL's safety priorities, prevention approach and public-interest learning.", ['Citizen awareness', 'Aggregated safety learning', 'Transparent communication'], ['No confidential operational, personal or security-sensitive information is displayed in this public view.', 'SIF precursor trends are communicated at an aggregated level to support public understanding.', "Formal information requests should follow OIL's official RTI and public-information channels."]],
  'Vendor registration': ['VENDOR SERVICES', 'Vendor registration', 'Contractor and vendor participation is central to safe execution across maintenance, projects and field operations.', ['Contractor assurance', 'Prequalification', 'Safe execution'], ['Vendor information is not collected by this prototype.', 'The Analyzer can demonstrate how contractor observations are classified.', 'Official registration should be completed through OIL’s approved portal.']],
  Tenders: ['VENDOR SERVICES', 'Tenders and procurement', 'Safe procurement includes clear work scopes, permit expectations and Life-Saving Rule requirements.', ['Transparent process', 'Work scope clarity', 'Safety requirements'], ['This page explains the connection between procurement and operational risk.', 'No tender documents or submissions are handled in the demo.', 'Use OIL’s official website for current tender notices.']],
  'Supplier information': ['VENDOR SERVICES', 'Supplier information', 'Suppliers and contractors contribute to the barrier system that keeps OIL operations safe.', ['Supplier assurance', 'Performance learning', 'Field controls'], ['Recurring supplier-related observations can be grouped by activity and barrier failure.', 'The dashboard uses synthetic examples for demonstration.', 'Official supplier records remain outside this prototype.']],
  'News and updates': ['MEDIA CENTRE', 'HSSE news and updates', 'Follow the latest safety intelligence signals and the interventions being prioritised across OIL operations.', ['03 priority cases', '06 rules mapped', '14 min triage SLA'], ['The alert ticker highlights the most urgent demo signals.', 'News cards on the home page summarise current operational themes.', 'Open Reports to test a new observation.']],
  'Press releases': ['MEDIA CENTRE', 'Press releases', 'A clear, evidence-led safety story helps communicate how OIL is strengthening prevention before events occur.', ['Public communication', 'Safety learning', 'Responsible disclosure'], ['This prototype is not an official press-release repository.', 'Use the OIL corporate website for published releases.', 'The dashboard content is synthetic for SIH judging.']],
  Publications: ['MEDIA CENTRE', 'Publications and learning', 'Convert recurring precursor patterns into practical learning material for field teams, supervisors and reviewers.', ['Learning briefs', 'Rule guidance', 'Trend reports'], ['Activity and barrier clusters provide a starting point for focused learning.', 'Life-Saving Rule coverage helps standardise interventions.', 'Use Analytics to explore the prototype patterns.']]
};

const sifContent = {
  'How It Works': ['SIF INTELLIGENCE', 'Predict risk before it becomes a fatality.', 'Turn field observations into focused intervention with an explainable workflow for unsafe acts, unsafe conditions and near misses.', ['Ingest', 'Understand', 'Detect', 'Score', 'Prioritize', 'Act'], ['FIELD OBSERVATION', 'REPORT INGESTION', 'NLP / AI ANALYSIS', 'HAZARD EXTRACTION', 'SIF PRECURSOR DETECTION', 'RISK SCORING', 'LIFE-SAVING RULE', 'REVIEW PRIORITY', 'INTERVENTION']],
  'Analyze a Report': ['SIF INTELLIGENCE', 'Analyze a safety report', 'Use the interactive report triage workspace to classify an illustrative observation and see how hazards map to SIF potential and Life-Saving Rules.', ['Demo analysis', 'Explainable output', 'HSE review'], ['Paste an unsafe-act, unsafe-condition or near-miss narrative into Reports.', 'The result is clearly marked demo data unless the configured API is connected.', 'Use the recommendation as a starting point for human review, not as an automated decision.']],
  'Risk Dashboard': ['SIF INTELLIGENCE', 'Risk dashboard', 'A focused view of synthetic precursor patterns, priority cases and rule distribution for the hackathon demonstration.', ['3,000 demo reports', '29.9% demo SIF-potential', '06 illustrative rules'], ['All dashboard figures are synthetic demonstration data.', 'Site and activity rankings help teams focus review capacity.', 'Use the Analyzer to trace a dashboard signal back to a narrative.']],
  'Life-Saving Rules': ['SIF INTELLIGENCE', 'Illustrative safety categories', 'These categories demonstrate how an intelligence layer can map reported hazards to a common intervention language. They are not presented as official OIL policy wording.', ['Energy Isolation', 'Line of Fire', 'Working at Height'], ['Verify isolation before work and control stored energy.', 'Stay clear of released energy, suspended loads and moving equipment.', 'Use appropriate fall protection and rescue controls.']]
};

const operationFlows = {
  Upstream: ['EXPLORATION', 'DRILLING', 'WELL OPERATIONS', 'PRODUCTION', 'FIELD ACTIVITIES'],
  Midstream: ['FIELD', 'GATHERING', 'PIPELINE', 'PUMPING', 'PROCESSING', 'MARKET'],
  Downstream: ['REFINING', 'PROCESS SAFETY', 'EQUIPMENT', 'MAINTENANCE', 'WORKER SAFETY'],
  'Alternate energy': ['ENERGY TRANSITION', 'NATURAL GAS', 'EMERGING ENERGY', 'SUSTAINABLE OPERATIONS', 'INNOVATION']
};

const exposureGroups = {
  Upstream: ['Line of fire', 'Energy isolation', 'Pressure', 'Lifting', 'Working at height', 'Confined space', 'Mobile equipment', 'SIMOPS'],
  Midstream: ['Pressure', 'Isolation', 'Pipeline integrity', 'Maintenance', 'Leak / release', 'Line of fire'],
  Downstream: ['Process safety', 'Equipment integrity', 'Maintenance exposure', 'Worker safety'],
  'Alternate energy': ['Contractor assurance', 'Energy transition', 'Technology pilots', 'Sustainable operations']
};

function App() {
  const [active, setActive] = useState(() => window.location.hash.replace('#', '') || 'overview');
  const [report, setReport] = useState(sampleReports[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiLive, setApiLive] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [role, setRole] = useState('safety_officer');
  const [siteData, setSiteData] = useState(sites);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('Oil at a glance');
  const profile = roleProfiles[role];
  const heroVideoRef = useRef(null);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const restartVideo = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    const handleEnded = () => {
      restartVideo();
    };

    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.15) {
        restartVideo();
      }
    };

    const handlePause = () => {
      if (video.duration && video.currentTime >= video.duration - 0.3) {
        restartVideo();
      }
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('pause', handlePause);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('pause', handlePause);
    };
  }, [active]);

  useEffect(() => {
    const handlePopState = () => {
      const next = window.location.hash.replace('#', '') || 'overview';
      if (profile.sections.includes(next)) setActive(next);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [profile.sections]);

  useEffect(() => {
    fetch(`${API_BASE}/health`).then((response) => response.ok && response.json())
      .then((data) => setApiLive(Boolean(data?.models_ready)))
      .catch(() => setApiLive(false));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/sites`)
      .then((response) => {
        if (!response.ok) throw new Error('Sites API unavailable');
        return response.json();
      })
      .then((data) => {
        const liveSites = (data.sites || []).map((site, index) => ({
          name: site.site,
          region: site.site === 'Rajasthan' ? 'Western Onshore' : 'Upper Assam',
          reports: site.report_count,
          sif: site.sif_count,
          rule: site.top_life_saving_rule || 'Unclassified',
          tone: index === 0 ? 'amber' : index < 3 ? 'red' : 'blue'
        }));
        if (liveSites.length) setSiteData(liveSites);
      })
      .catch(() => setSiteData(sites))
      .finally(() => setSitesLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    }), { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && setOpenMenu(null);
    const closeOnOutsideClick = (event) => {
      if (!event.target.closest('.nav-dropdown')) setOpenMenu(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('mousedown', closeOnOutsideClick);
    };
  }, []);

  async function analyzeReport(event) {
    event.preventDefault();
    if (!report.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/classify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: report })
      });
      if (!response.ok) throw new Error('API unavailable');
      setResult(await response.json());
      setApiLive(true);
    } catch {
      const highRisk = /energized|loto|hot work|welding|confined|tank|gas test|pressure|crane|harness/i.test(report);
      setResult({
        sif_potential: highRisk,
        sif_score: highRisk ? 86 : 18,
        life_saving_rules: highRisk ? ['Energy Isolation', 'Work Authorisation'] : ['Unclassified'],
        precursor_factors: highRisk ? ['high-energy exposure', 'control or permit failure'] : ['low-energy observation']
      });
    } finally { setLoading(false); }
  }

  function navigate(section) {
    if (!profile.sections.includes(section)) return;
    setActive(section);
    window.history.pushState({ section }, '', `#${section}`);
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function selectMenuItem(item) {
    setOpenMenu(null);
    setSelectedMenu(item);
    const destination = { 'Analyze a Report': 'analyzer', 'Risk Dashboard': 'overview', 'Life-Saving Rules': 'rules' }[item];
    if (destination) {
      navigate(destination);
      return;
    }
    navigate('info');
  }

  return (
    <div className="app-shell">
      <div className="utility-bar"><div className="utility-identity">भारत सरकार | Government of India</div><div className="utility-links"><a className="skip-link" href="#main-content">Skip to Main Content</a><span>A-</span><span>A A+</span><span>English⌄</span></div></div>
      <header className="site-header">
        <div className="header-inner">
          <button className="brand brand-button" onClick={() => navigate('overview')} aria-label="Oil India Limited home"><img className="oil-logo" src="/oil-logo.svg" alt="Oil India Limited emblem" /><div><strong>OIL INDIA LIMITED</strong><small>Conquering Newer Horizons</small></div></button>
          <nav className="main-nav" aria-label="Primary navigation">
            {Object.entries(navGroups).map(([label, items]) => <div className={`nav-dropdown ${openMenu === label ? 'menu-open' : ''}`} key={label} onMouseEnter={() => setOpenMenu(label)} onMouseLeave={() => setOpenMenu(null)}><button className="nav-link" onClick={() => setOpenMenu(openMenu === label ? null : label)} aria-expanded={openMenu === label}>{label}<ChevronDown size={13} /></button>{openMenu === label && <div className="dropdown-menu">{items.map((item) => <button key={item} onClick={() => selectMenuItem(item)}>{item}<ChevronRight size={14} /></button>)}</div>}</div>)}
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex="-1">
        {active === 'overview' && <section className="hero-section reveal" id="top">
          <div className="hero-copy"><p className="eyebrow"><span /> OIL CORPORATE HSSE DIRECTORATE</p><h1>Predict risk<br /><em>before it becomes a fatality.</em></h1><p className="hero-lede">SIF Precursor Intelligence System identifies high-energy exposures in unsafe acts, unsafe conditions and near-miss reports across OIL operations.</p><div className="hero-actions"><button className="primary-button" onClick={() => navigate('analyzer')}>Analyze a report <ArrowUpRight size={17} /></button><button className="text-button" onClick={() => navigate('sites')}>View site priorities <MapPin size={16} /></button></div></div>
          <div className="hero-panel"><video ref={heroVideoRef} className="hero-video" autoPlay muted loop playsInline preload="auto" src="/assets/videos/refinery-hero.mp4" onEnded={(e) => { try { e.currentTarget.currentTime = 0; e.currentTarget.play().catch(() => {}); } catch (_) {} }}><source src="/assets/videos/refinery-hero.mp4" type="video/mp4" /></video><div className="panel-kicker"><Activity size={16} /> Operational view <span>FY 2025-26</span></div><div className="hero-number">3,000<small> reports monitored</small></div><div className="hero-divider" /><div className="hero-mini-grid"><div><strong>29.9%</strong><span>SIF-potential</span></div><div><strong>06</strong><span>priority rules</span></div><div><strong>14 min</strong><span>triage SLA</span></div></div><div className="panel-foot"><span className="pulse" /> Model status: {apiLive ? 'connected to OIL API' : 'local demonstration engine'}</div></div>
        </section>}
        {active === 'overview' && <div className="alert-ticker"><div className="ticker-label"><Siren size={14} /> SIF ALERTS TODAY</div><div className="ticker-track"><span><b>03 priority cases</b> require statutory review</span><span>Rajasthan: bypassed safety controls detected</span><span>Duliajan: Energy Isolation remains the leading precursor</span></div><div className="ticker-date">09 SEP 2026</div></div>}
        <div className="sub-header"><div className="sub-header-inner"><span>Corporate HSSE Directorate</span><span className="slash">/</span><span>SIF Precursor Intelligence System</span><span className={apiLive ? 'system-state live' : 'system-state'}><i />{apiLive ? 'Live model connected' : 'Demo mode'}</span></div></div>

        <section key={active} className={`workspace-section reveal is-visible ${active === 'overview' ? '' : 'section-page'}`}>
          {active !== 'info' && <div className="section-heading"><div><p className="eyebrow">CONTROL ROOM <span className="breadcrumb-separator">/</span> {active === 'overview' ? 'Dashboard' : active === 'analyzer' ? 'Reports' : active === 'sites' ? 'Analytics' : active === 'rules' ? 'Life-Saving Rules' : 'Statutory Review'}</p><h2>{active === 'overview' ? 'HSSE precursor overview' : active === 'analyzer' ? 'Report triage workspace' : active === 'sites' ? 'Site and activity priorities' : active === 'rules' ? 'Life-Saving Rule coverage' : 'Statutory review queue'}</h2></div>{active !== 'overview' && <button className="back-button" onClick={() => navigate('overview')}><ArrowLeft size={14} /> Back to dashboard</button>}</div>}
          {active !== 'info' && <RoleContext profile={profile} navigate={navigate} active={active} />}
          {active === 'analyzer' ? <Analyzer report={report} setReport={setReport} result={result} loading={loading} analyzeReport={analyzeReport} /> : active === 'sites' ? <SitePriorities profile={profile} /> : active === 'rules' ? <RulesView /> : active === 'governance' ? <GovernanceView /> : active === 'info' ? <InformationPage item={selectedMenu} navigate={navigate} /> : <Overview navigate={navigate} profile={profile} siteData={siteData} sitesLoading={sitesLoading} />}
        </section>
        {active === 'overview' && <><OperatingSegments navigate={navigate} /><ProductVideo navigate={navigate} /><NewsRail navigate={navigate} /></>}
      </main>

      <footer className="oil-footer">
        <div className="footer-main">
          <div className="footer-office">
            <span className="footer-kicker">Corporate Office</span>
            <strong>Oil India Limited</strong>
            <p>Plot No. 19, New Film City, Sector<br />16A, Noida - 201301, India</p>
            <a href="tel:01202419000">☎ &nbsp;0120 - 2419000</a>
            <a href="tel:01202488310">▣ &nbsp;0120 - 2488310</a>
            <a href="mailto:oilindia@oilindia.in">✉ &nbsp;oilindia[at]oilindia[dot]in</a>
            <a href="mailto:webmaster@oilindia.in">✉ &nbsp;webmaster[at]oilindia[dot]in</a>
          </div>
          <FooterLinks title="Quick Links" items={['RTI', 'Contact Us', 'NorthEast Gas Subsidiary']} />
          <FooterLinks title="Resources" items={['Feedback', 'Integrity Pact', 'Applicable Acts and Others']} />
          <FooterLinks title="Governance" items={['Complaint Handling System', 'Preservation of Documents and Archival Policy', 'Memorandum of Understanding']} />
          <FooterLinks title="Public Information" items={["Citizen's Charter", 'Website Policies']} />
        </div>
        <div className="footer-bottom">© Oil India Limited · Ministry of Petroleum & Natural Gas · Government of India <span>SPIS prototype · Synthetic demonstration data</span></div>
      </footer>
    </div>
  );
}

function RoleContext({ profile, navigate, active }) {
  const viewLabels = { overview: 'Dashboard', analyzer: 'Reports', sites: 'Analytics', rules: 'Life-Saving Rules', governance: 'Statutory Review', info: 'Information' };
  return <div className={`role-context ${profile.color}`}>
    <div><span className="role-context-label">Active workspace</span><strong>{profile.label}</strong></div>
    <span>{profile.scope} · Data scope: {profile.sites}</span>
    <div className="enabled-views"><div className="view-links">{profile.sections.map((section) => <button key={section} className={active === section ? 'active' : ''} onClick={() => navigate(section)}>{viewLabels[section]}</button>)}</div></div>
  </div>;
}
function FooterLinks({ title, items }) {
  return <div className="footer-links-column"><span className="footer-kicker">{title}</span>{items.map((item) => <a href="#main-content" key={item}><b>›</b>{item}</a>)}</div>;
}
function InformationPage({ item, navigate }) {
  const content = sifContent[item] || menuContent[item] || menuContent['Oil at a glance'];
  const [eyebrow, title, description, stats, points] = content;
  const isSif = Boolean(sifContent[item]);
  const isOperation = Boolean(operationFlows[item]);
  const isDownstream = item === 'Downstream';
  const flow = operationFlows[item] || (isSif ? points : []);
  const exposures = exposureGroups[item] || [];
  return <div className="information-page reveal is-visible">
    <div className="information-hero">
      <div>
        <p className="eyebrow"><span />{eyebrow}</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="information-actions">
        <button className="primary-button" onClick={() => navigate('overview')}>Back to Dashboard <ArrowUpRight size={16} /></button>
        <button className="text-button" onClick={() => navigate('analyzer')}>Try report analyzer <FileText size={16} /></button>
      </div>
    </div>
    {isDownstream && <div className="information-video"><video autoPlay muted loop playsInline preload="auto" src="/assets/videos/refinery-hero.mp4" onEnded={(e) => { try { e.currentTarget.currentTime = 0; e.currentTarget.play().catch(() => {}); } catch (_) {} }}><source src="/assets/videos/refinery-hero.mp4" type="video/mp4" /></video><div><span className="eyebrow">PROCESS OPERATIONS</span><strong>From hydrocarbon to high-value products.</strong><p>Operational complexity needs an intelligence layer that helps teams see exposure before consequence.</p></div></div>}
    {isOperation && <div className="information-flow">{flow.map((step, index) => <div key={step}><span>0{index + 1}</span><strong>{step}</strong>{index < flow.length - 1 && <ChevronRight size={15} />}</div>)}</div>}
    <div className="information-stats">{stats.map((stat) => <div key={stat}><strong>{stat}</strong><span>SPIS focus area</span></div>)}</div>
    {isOperation && <div className="information-exposures"><div><p className="eyebrow">WHERE SIF PRECURSORS EMERGE</p><h4>Signals across the operation</h4></div><div className="exposure-list">{exposures.map((exposure) => <span key={exposure}>{exposure}</span>)}</div></div>}
    {(isOperation || isSif || item === 'Oil at a glance' || item === 'Vision & values') && <div className="intelligence-bridge"><span className="eyebrow">SIF PRECURSOR INTELLIGENCE SYSTEM</span><strong>From observation to focused intervention.</strong><p>Unsafe acts, unsafe conditions and near misses can become structured signals for hazard extraction, risk scoring and HSE review.</p><button className="primary-button" onClick={() => navigate('analyzer')}>Analyze a report <ArrowUpRight size={16} /></button></div>}
    {isSif && <div className="sif-flow" aria-label="SIF intelligence workflow">{points.map((step, index) => <div className="sif-flow-step" key={step}><span>0{index + 1}</span><strong>{step}</strong>{index < points.length - 1 && <ChevronRight size={15} />}</div>)}</div>}
    <div className="information-detail">
      <div className="full-panel"><div className="card-title"><span><ShieldCheck size={17} /> What this means for SPIS</span></div><div className="information-points">{points.map((point, index) => <div key={point}><b>0{index + 1}</b><p>{point}</p></div>)}</div></div>
      <div className="full-panel information-next"><div className="card-title"><span><Sparkles size={17} /> Continue exploring</span></div><button onClick={() => navigate('sites')}>Site and activity priorities <ArrowUpRight size={15} /></button><button onClick={() => navigate('rules')}>Life-Saving Rule coverage <ArrowUpRight size={15} /></button></div>
    </div>
  </div>;
}
function Overview({ navigate, profile, siteData, sitesLoading }) {
  const fieldView = profile.label === 'Field Engineer';
  return <div className="overview-grid">
    <div className="overview-top-left">
      <div className="metric-grid"><Metric icon={<FileText />} value={fieldView ? '128' : '3,000'} label="Reports analyzed" note={fieldView ? 'Assigned field queue' : 'Across OIL operating areas'} /><Metric icon={<Siren />} value={fieldView ? '34' : '899'} label="SIF-potential flagged" note={fieldView ? '26.6% of field reports' : '29.9% of all reports'} danger /><Metric icon={<Target />} value={fieldView ? '11' : '270'} label="Critical cases" note="Score 90 and above" danger /></div>
      <div className="signal-card"><div className="card-title"><span><Sparkles size={17} /> Leading precursor signals</span><button onClick={() => navigate('analyzer')}>Open analyzer <ArrowUpRight size={15} /></button></div><div className="signal-list">{[['Energy isolation failure', 74, 'amber'], ['Permit / authorisation gap', 58, 'blue'], ['Line-of-fire exposure', 47, 'red']].map(([label, value, tone]) => <div className="signal-row" key={label}><div><strong>{label}</strong><span>{value} flagged reports</span></div><div className="bar"><i className={tone} style={{ width: `${value}%` }} /></div><b>{value}%</b></div>)}</div></div>
    </div>
    <SiteCard profile={profile} siteData={siteData} sitesLoading={sitesLoading} />
    <ActivityCard />
    <div className="rules-card"><div className="card-title"><span><ShieldCheck size={17} /> Life-Saving Rule coverage</span><span className="muted">SIF-potential reports</span></div>{rules.slice(0, 5).map(([rule, value, note]) => <div className="rule-row" key={rule}><span className="rule-icon"><LockKeyhole size={14} /></span><div><strong>{rule}</strong><small>{note}</small></div><b>{value}%</b></div>)}</div>
  </div>;
}

function Metric({ icon, value, label, note, danger }) { return <div className={danger ? 'metric-card danger' : 'metric-card'}><div className="metric-icon">{icon}</div><strong>{value}</strong><b>{label}</b><span>{note}</span></div>; }
function SiteCard({ profile, siteData, sitesLoading }) { const visibleSites = profile.label === 'Field Engineer' ? siteData.filter((site) => site.name === 'Duliajan') : siteData; return <div className="site-card"><div className="card-title"><span><MapPin size={17} /> Highest priority sites</span><span className="muted">{sitesLoading ? 'Loading live data' : profile.label === 'Field Engineer' ? 'Assigned site' : 'SIF density'}</span></div>{visibleSites.slice(0, 4).map((site) => <div className="site-row" key={site.name}><div className={`site-rank ${site.tone}`}>{site.name.slice(0, 2).toUpperCase()}</div><div className="site-details"><strong>{site.name}</strong><span>{site.region} · {site.rule}</span></div><div className="site-score"><b>{Math.round(site.sif / site.reports * 100)}%</b><small>{site.sif} cases</small></div></div>)}</div>; }
function ActivityCard() { return <div className="activity-card"><div className="card-title"><span><BarChart3 size={17} /> Activity risk ranking</span><span className="muted">SIF density index</span></div>{activities.map(([activity, value, rule]) => <div className="activity-row" key={activity}><div><strong>{activity}</strong><span>{rule}</span></div><div className="bar"><i className="green" style={{ width: `${value}%` }} /></div><b>{value}</b></div>)}</div>; }
function RulesView() { return <div className="rules-view">{rules.map(([rule, value, note]) => <div className="rule-detail" key={rule}><span className="rule-icon"><LockKeyhole size={15} /></span><div><strong>{rule}</strong><p>{note}</p></div><b>{value}%</b></div>)}</div>; }
function NewsRail({ navigate }) { return <section className="news-rail reveal"><div className="news-heading"><div><p className="eyebrow">WHAT'S NEW</p><h3>Safety intelligence updates</h3></div><button onClick={() => navigate('analyzer')}>View all <ArrowUpRight size={15} /></button></div><div className="news-grid"><article><span>PRIORITY ALERT · RAJASTHAN</span><h4>Bypassed safety controls detected at RJ-12 well</h4><p>Immediate review assigned to the statutory safety queue.</p></article><article><span>MODEL UPDATE · FY 2025-26</span><h4>3,000 reports mapped to six Life-Saving Rules</h4><p>Evidence-led triage is active across field operations.</p></article><article><span>FIELD FOCUS · DULIAJAN</span><h4>Energy Isolation is the leading precursor signal</h4><p>Open the analyzer to test a report from your site.</p></article></div></section>; }
function OperatingSegments({ navigate }) {
  const segments = [
    { number: '01', name: 'Upstream', label: 'EXPLORATION & PRODUCTION', text: 'From exploration to production, SPIS helps field teams see high-energy exposures before they become serious events.', image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1500&q=85', rule: 'Energy Isolation · Line of Fire' },
    { number: '02', name: 'Midstream', label: 'TRANSPORT & STORAGE', text: 'Pipeline, tank and transfer activities are prioritised around permit quality, isolation and confined-space controls.', image: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=1500&q=85', rule: 'Hot Work · Confined Space' },
    { number: '03', name: 'Downstream', label: 'PROCESS OPERATIONS', text: 'Process operations stay safer when barrier failures, authorisation gaps and line-of-fire exposures are visible early.', image: 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=1500&q=85', rule: 'Work Authorisation · Safe Lifting' }
  ];
  return <section className="operating-segments reveal" aria-labelledby="operating-segments-title">
    <div className="segments-heading"><div><p className="eyebrow">ONE OIL · MANY OPERATING CONTEXTS</p><h3 id="operating-segments-title">Safety intelligence across the value chain</h3></div><p>Scroll to explore the sequence</p></div>
    <div className="segment-rail" aria-label="Operating segments">
      {segments.map((segment) => <article className="segment-card" key={segment.name}>
        <div className="segment-image" style={{ backgroundImage: `linear-gradient(90deg, #003d2ccc 0%, #00563f66 60%, #00563f11 100%), url(${segment.image})` }}><span className="segment-number">{segment.number}</span><span className="segment-label">{segment.label}</span><div className="segment-image-title">{segment.name}</div></div>
        <div className="segment-copy"><p>{segment.text}</p><span className="segment-rule">{segment.rule}</span><button className="text-button" onClick={() => navigate('info')}>Explore {segment.name} <ArrowUpRight size={15} /></button></div>
      </article>)}
    </div>
    <div className="segment-scroll-hint"><span>01</span><i /><span>03</span></div>
  </section>;
}
function ProductVideo({ navigate }) { return <section className="product-video reveal" aria-labelledby="product-video-title"><div className="video-copy"><p className="eyebrow">SEE SPIS IN ACTION</p><h3 id="product-video-title">From field observation<br /><em>to focused intervention.</em></h3><p>Watch how the intelligence layer turns a free-text report into a SIF score, Life-Saving Rule tag and a clear review priority for HSE teams.</p><div className="video-steps"><span><b>01</b> Ingest report</span><span><b>02</b> Detect precursor</span><span><b>03</b> Prioritise action</span></div><button className="text-button" onClick={() => navigate('analyzer')}>Open live analyzer <ArrowUpRight size={16} /></button></div><div className="video-frame"><video controls muted loop playsInline preload="metadata" poster="https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=82" aria-label="Industrial field operations video"><source src="https://cdn.coverr.co/videos/coverr-aerial-view-of-an-oil-refinery-1573/1080p.mp4" type="video/mp4" /><track kind="captions" /></video><div className="video-badge"><span className="pulse" /> Product walkthrough · demo data</div></div></section>; }
function SitePriorities({ profile }) { const visibleSites = profile.label === 'Field Engineer' ? sites.filter((site) => site.name === 'Duliajan') : sites; return <div className="full-panel"><div className="panel-intro"><div><p className="eyebrow">INTERVENTION QUEUE</p><h3>Ranked by SIF-precursor density</h3></div><span className="date-chip">Updated 09 Sep 2026</span></div>{visibleSites.map((site, index) => <div className="priority-row" key={site.name}><b className="priority-number">0{index + 1}</b><div className={`site-rank ${site.tone}`}>{site.name.slice(0, 2).toUpperCase()}</div><div className="site-details"><strong>{site.name}</strong><span>{site.region} operations</span></div><div className="priority-rule"><span>Leading rule</span><b>{site.rule}</b></div><div className="priority-density"><b>{Math.round(site.sif / site.reports * 100)}%</b><span>{site.sif} / {site.reports} reports</span></div></div>)}</div>; }
function GovernanceView() { return <div className="governance-grid"><div className="full-panel"><div className="panel-intro"><div><p className="eyebrow">DIRECTORATE OVERSIGHT</p><h3>Statutory review queue</h3></div><span className="date-chip">Restricted view</span></div>{[['Rajasthan RJ-12', 'Bypassed safety controls', 'Immediate review'], ['Moran GGS', 'Hot work without gas test', 'Pending sign-off'], ['Duliajan MCC', 'Isolation not verified', 'Action assigned']].map(([site, issue, status]) => <div className="audit-row" key={site}><div><strong>{site}</strong><span>{issue}</span></div><b>{status}</b></div>)}</div><div className="full-panel audit-summary"><div className="card-title"><span><ShieldCheck size={17} /> Compliance summary</span></div><div className="audit-stat"><strong>94%</strong><span>review SLA met</span></div><div className="audit-stat"><strong>18</strong><span>open corrective actions</span></div><div className="audit-stat"><strong>06</strong><span>rules under observation</span></div></div></div>; }
function Analyzer({ report, setReport, result, loading, analyzeReport }) { return <div className="analyzer-layout"><form className="analyzer-form" onSubmit={analyzeReport}><div className="panel-intro"><div><p className="eyebrow">DEMO ANALYSIS</p><h3>Analyze an HSSE report</h3></div><span className="date-chip"><Gauge size={14} /> NLP classifier</span></div><label htmlFor="report">Observation narrative</label><textarea id="report" value={report} onChange={(event) => setReport(event.target.value)} placeholder="Paste an unsafe-act, unsafe-condition or near-miss report..." /><div className="sample-row"><span>Try a sample</span>{sampleReports.map((sample, index) => <button type="button" key={sample} onClick={() => setReport(sample)}>0{index + 1}</button>)}</div><button className="primary-button analyze-button" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Report'} <Sparkles size={16} /></button></form><div className={result ? 'result-panel ready' : 'result-panel'}>{result ? <><div className="result-status"><div className={result.sif_potential ? 'result-icon critical' : 'result-icon safe'}>{result.sif_potential ? <AlertTriangle /> : <CheckCircle2 />}</div><div><span>Classification · Demo data</span><h3>{result.sif_potential ? 'SIF-potential detected' : 'Non-SIF-potential'}</h3></div><strong>{result.sif_score}<small>/100</small></strong></div><div className="result-rule"><span>Primary Life-Saving Rule</span><b>{result.life_saving_rules?.[0] || 'Unclassified'}</b></div><div className="result-factors"><span>Signals found</span>{(result.precursor_factors || []).slice(0, 4).map((factor) => <em key={factor}>{factor}</em>)}</div><div className="review-note"><Flame size={16} /> Review queue: {result.sif_potential ? 'priority intervention recommended' : 'routine observation follow-up'}</div></> : <div className="empty-result"><Sparkles size={26} /><h3>Your triage result will appear here</h3><p>Submit a report to see the SIF score, precursor signals and mapped Life-Saving Rule.</p></div>}</div></div>; }

createRoot(document.getElementById('root')).render(<App />);
