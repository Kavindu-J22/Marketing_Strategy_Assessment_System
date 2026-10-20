#!/usr/bin/env python3
"""Reproducible scenario generator for the Marketing Strategy Assessment proposal.
Creates SYNTHETIC, NOT OBSERVED, fictional Sri Lankan technology-product cases.
It must NOT be presented as completed primary data collection or field validation.
Uses Python standard library only (plus artifact_tool in separate workbook builder).
"""
import csv, json, random, math, os, re, statistics
from collections import Counter, defaultdict
from datetime import date

OUT='/mnt/data'
SEED=20261020
rng=random.Random(SEED)
N_PROFILES=1000
SCENARIOS_PER_PROFILE=5
GOALS=['More website visitors','More leads','More sales','More social media engagement','More brand awareness']
CHANNELS=['Facebook','Instagram','LinkedIn','TikTok','YouTube','Google Ads','Email Marketing','Website/SEO']
ROLES=['Business owner','IT professional','Student','Manager','Accountant','General consumer','Operations staff','Educator','Healthcare administrator','Marketing executive']
AGES=['18-24','25-34','35-44','45-54','55+','Multiple age groups']
LOCATIONS=['All Sri Lanka','Western Province','Southern Province','Central Province','North Western Province','Northern Province','Eastern Province','North Central Province','Sabaragamuwa Province','Uva Province','Colombo','Gampaha','Kandy','Galle','Kurunegala','Jaffna','Batticaloa','Anuradhapura','Matara','Negombo']
VOCAB=['Nivora','Velora','Serendi','Ceytra','Navora','Aruna','Lanora','Senvia','Pivora','Teklora','Zentra','Isura','Novira','Kavora','Lankora','Helora','Valora','Nexora']

# Fictional product/service patterns. Each: industry, product, feature pool, benefit, customer problem, roles, audience, tech adjectives
DOMAINS={
 'Software / SaaS':[
  ('Inventory Control Cloud',['barcode stock logging','multi-branch stock alerts','role-based dashboards','automated purchase orders','cloud data synchronization'],'keep stock organized and avoid preventable shortages','manual stock updates lead to shortages',['Business owner','Manager','Operations staff','Accountant'],'retail shops, wholesalers and multi-outlet operators'),
  ('Appointment Scheduling Hub',['online booking portal','calendar integrations','automated reminders','waitlist management','attendance reports'],'simplify bookings and reduce missed appointments','booking by phone causes scheduling conflicts',['Business owner','Manager','General consumer'],'service providers and appointment-driven businesses'),
  ('Payroll & Attendance Suite',['biometric attendance integration','leave requests','payroll export','attendance analytics','access permissions'],'reduce administrative work and payroll mistakes','manual attendance and payroll reconciliation is time-consuming',['Manager','Accountant','Business owner'],'SMEs managing staff time and payroll'),
  ('Customer Service CRM',['lead pipeline tracking','email integrations','customer segmentation','task reminders','sales reporting'],'keep customer interactions organized and follow up faster','disconnected customer records result in missed leads',['Business owner','Marketing executive','Manager'],'growing sales and service teams'),
  ('Fleet Operations Portal',['vehicle tracking dashboard','maintenance reminders','route assignment','driver task lists','fuel log reports'],'manage vehicles and maintenance in one place','manual fleet records create delays',['Manager','Operations staff','Business owner'],'fleet administrators and transport operators')],
 'FinTech':[
  ('Invoice Reconciliation Tool',['bank statement matching','invoice templates','payment reminders','tax-ready reports','approval workflows'],'make invoicing and payment reconciliation easier','late invoices and manual reconciliation delay accounting',['Accountant','Business owner','Manager'],'SME finance teams and accounting practices'),
  ('Merchant Payment Dashboard',['transaction summaries','QR payment records','refund tracking','merchant settlement reports','role permissions'],'review business payments with clearer records','payment records are spread across multiple services',['Business owner','Accountant','Manager'],'shops and digital merchants'),
  ('Expense Approval Cloud',['expense submission','receipt capture','budget alerts','approval routing','monthly cost dashboards'],'control and monitor day-to-day spending','expense claims take too long to approve',['Manager','Accountant','Business owner'],'finance and operations teams')],
 'E-commerce':[
  ('Online Store Builder',['product catalogue editor','online checkout integrations','order tracking','coupon management','mobile-friendly storefront'],'launch and operate an online storefront more easily','small sellers struggle to coordinate online orders',['Business owner','Marketing executive','General consumer'],'small retail brands and independent sellers'),
  ('Order Management Desk',['multi-channel order inbox','courier dispatch integration','returns tracking','inventory sync','sales analytics'],'handle orders across sales channels in one workflow','orders arriving through multiple channels are hard to manage',['Business owner','Operations staff','Manager'],'social-commerce and delivery-oriented retailers'),
  ('Retail Catalogue Sync',['catalogue import','price update automation','stock level sync','product photo tools','campaign tagging'],'publish consistent product information faster','prices and stock quantities differ across sales channels',['Business owner','Marketing executive','Manager'],'merchants selling through multiple online channels')],
 'Healthcare Technology':[
  ('Clinic Queue Manager',['patient queue tokens','digital visit scheduling','visit history viewer','appointment reminders','staff dashboard'],'organize clinic appointments and waiting lists','clinic queues and manual bookings create delays',['Healthcare administrator','Manager','General consumer'],'clinic administrators, reception teams and patients'),
  ('Pharmacy Stock Desk',['batch tracking','expiry alerts','reorder planning','supplier ledger','daily stock reports'],'reduce expired stock and improve pharmacy stock visibility','pharmacy stock checks are difficult to maintain manually',['Healthcare administrator','Business owner','Operations staff'],'independent pharmacies and healthcare distributors'),
  ('Lab Booking Portal',['lab test booking','results notification','consent-based patient access','appointment tracking','service catalogue'],'make lab appointment scheduling and result access simpler','customers find test scheduling and result collection inconvenient',['Healthcare administrator','General consumer','Manager'],'diagnostic centres and their customers')],
 'Education Technology':[
  ('Learning Management Space',['lesson delivery','quiz analytics','assignment uploads','student progress reports','parent notifications'],'organize learning activities and track progress','teachers have fragmented records of homework and progress',['Educator','Student','Manager'],'teachers, tutors, students and training institutes'),
  ('Tuition Class Planner',['class scheduling','fee reminders','attendance QR','lesson sharing','class announcements'],'help tutoring centres manage scheduling and attendance','paper attendance and fee tracking take extra time',['Educator','Business owner','Student'],'tuition teachers and training centre operators'),
  ('School Administration Portal',['student records','parent communication','fee ledger','attendance reports','document exports'],'reduce school administration workload','disconnected student and fee records cause errors',['Educator','Manager','Accountant'],'private schools and education administrators')],
 'Artificial Intelligence':[
  ('Document Search Assistant',['semantic search','document classification','role-based document access','question-answer workspace','source highlighting'],'find relevant information across workplace documents faster','employees spend time finding details inside long documents',['IT professional','Manager','Business owner'],'knowledge workers and business support teams'),
  ('Support Ticket Assistant',['ticket categorization','response draft suggestions','sentiment summarization','handoff routing','helpdesk reporting'],'help customer support teams prioritize requests','support tickets are difficult to triage consistently',['IT professional','Marketing executive','Manager'],'digital support and customer success teams'),
  ('Invoice Data Reader',['receipt text extraction','field validation','invoice categorization','CSV export','exception review queue'],'reduce repetitive manual entry of invoice information','manual invoice entry takes time and creates mistakes',['Accountant','Manager','Business owner'],'accounts departments and small accounting firms')],
 'Cybersecurity':[
  ('Access Audit Console',['account activity logs','permission reviews','risk alerts','report exports','security checklists'],'understand and manage account access risks','businesses lack clear visibility into user permissions',['IT professional','Manager','Business owner'],'IT administrators and SME information-security teams'),
  ('Backup Recovery Monitor',['backup status dashboard','automated backup alerts','restore checklists','activity reports','role permissions'],'monitor whether backups are working as intended','unnoticed backup failures may disrupt business',['IT professional','Manager','Business owner'],'SMEs with cloud data and shared systems'),
  ('Security Awareness Portal',['staff learning modules','phishing awareness quizzes','policy acknowledgements','training progress dashboard','reminder scheduling'],'make staff security awareness training easier to manage','staff lack consistent practical cyber-safety training',['IT professional','Manager','Educator'],'organizations training non-specialist staff')],
 'Other':[
  ('Farm Operations Dashboard',['crop calendar','input usage records','weather note log','harvest tracking','sales summaries'],'help growers organize farming records and decisions','farm records and expenses are tracked inconsistently',['Business owner','Operations staff','General consumer'],'small farms and agri-service providers'),
  ('Guesthouse Booking Desk',['reservation calendar','rate settings','customer notifications','room inventory','occupancy reports'],'simplify guesthouse reservations and availability tracking','phone-based bookings create reservation conflicts',['Business owner','Manager','General consumer'],'small accommodation providers'),
  ('Delivery Dispatch Manager',['driver task lists','delivery status tracking','route assignment','proof-of-delivery uploads','customer updates'],'coordinate delivery tasks and improve visibility','dispatch updates are scattered across messages and calls',['Business owner','Operations staff','Manager'],'small delivery and distribution teams')]
}
INDUSTRY_WEIGHTS={'Software / SaaS':28,'FinTech':11,'E-commerce':16,'Healthcare Technology':10,'Education Technology':11,'Artificial Intelligence':11,'Cybersecurity':6,'Other':7}
SECTOR_GROUPS=['Micro startup','Small company','Medium company','Scale-up']
SECTOR_WEIGHTS=[36,40,19,5]

TECH_COMFORT=['Very low - uncomfortable with technology','Low - basic technology, struggles with terms','Medium - comfortable with common digital tools','High - advanced digital tools and concepts','Very high - highly technical professionals']
TECH_TERMS=['Not familiar at all','Slightly familiar','Moderately familiar','Very familiar','Highly familiar']
LANGUAGES=['Very simple, non-technical language','Mostly simple language','Balanced technical and simple language','Detailed and technical language','Highly technical and professional language']
PAINS=['Too much manual work','High operating costs','Low process efficiency','Frequent data entry errors','Limited information security','Complicated daily workflows','Difficulty tracking customers','Slow access to records','Missed appointments or orders','Inconsistent reporting']
BENEFIT_PAIN={'save time':'Too much manual work','cost':'High operating costs'}
CONTENT=['Short videos','Educational videos','Images/graphics','Articles/blogs','Case studies','Product demonstrations','Customer testimonials']
GOAL_KPI={'More website visitors':('Website visits/month',200,18000),'More leads':('Leads/month',10,350),'More sales':('Purchases/month',8,230),'More social media engagement':('Engagement actions/month',100,16000),'More brand awareness':('Estimated campaign reach/month',1500,120000)}
AHP_WEIGHTS={'audience_fit':0.34,'objective_fit':0.25,'cost_suitability':0.18,'reach_fit':0.13,'content_fit':0.10}
CHANNEL_BASE={'Facebook':{'reach':0.87,'cost':0.78},'Instagram':{'reach':0.77,'cost':0.82},'LinkedIn':{'reach':0.63,'cost':0.62},'TikTok':{'reach':0.78,'cost':0.82},'YouTube':{'reach':0.82,'cost':0.60},'Google Ads':{'reach':0.88,'cost':0.58},'Email Marketing':{'reach':0.43,'cost':0.91},'Website/SEO':{'reach':0.68,'cost':0.68}}


def choice_weighted(pairs):
    vals, weights = zip(*pairs)
    return rng.choices(vals, weights=weights,k=1)[0]

def clamp(x, low, high): return max(low,min(high,x))

def pick_unique(items, k, weights=None):
    remaining=list(items)
    result=[]
    for _ in range(min(k,len(remaining))):
        if weights is None: i=rng.randrange(len(remaining))
        else:
            ws=[max(0.0001,weights.get(v,1)) for v in remaining]
            i=remaining.index(rng.choices(remaining,ws,k=1)[0])
        result.append(remaining.pop(i))
    return result

def numeric_budget(size, industry):
    centers={'Micro startup':26000,'Small company':80000,'Medium company':210000,'Scale-up':570000}
    sector_mult={'Artificial Intelligence':1.12,'Cybersecurity':1.20,'FinTech':1.20,'Education Technology':0.87,'Other':0.85}.get(industry,1)
    val=centers[size]*sector_mult*rng.lognormvariate(0,0.53)
    val=clamp(val,6000,1500000)
    return int(round(val/1000)*1000)

def assign_market(industry):
    probs={'Software / SaaS':[0.61,0.12,0.27],'FinTech':[0.41,0.25,0.34],'E-commerce':[0.24,0.54,0.22], 'Healthcare Technology':[0.45,0.30,0.25],'Education Technology':[0.29,0.49,0.22],'Artificial Intelligence':[0.66,0.10,0.24],'Cybersecurity':[0.78,0.06,0.16],'Other':[0.43,0.37,0.20]}
    return rng.choices(['B2B','B2C','Both'],probs[industry],k=1)[0]

def assign_role(product_roles,market):
    ws=[]
    for r in product_roles:
        w=5.0
        if market=='B2B' and r in ['Business owner','Manager','IT professional','Accountant','Operations staff','Healthcare administrator','Educator']: w*=1.5
        if market=='B2C' and r in ['Student','General consumer']:w*=2.1
        ws.append(w)
    return rng.choices(product_roles,ws,k=1)[0]

def age_for_role(role):
    ws={'Student':[0.67,0.23,0.05,0.01,0.0,0.04], 'General consumer':[0.24,0.35,0.19,0.10,0.07,0.05], 'Business owner':[0.04,0.29,0.35,0.20,0.09,0.03], 'Manager':[0.02,0.23,0.38,0.25,0.09,0.03]}.get(role,[0.10,0.33,0.31,0.16,0.06,0.04])
    return rng.choices(AGES, ws,k=1)[0]

def audience_latent(role, industry, size):
    role_center={'IT professional':4.15,'Accountant':3.0,'Manager':3.18,'Business owner':2.95,'Operations staff':2.83,'Marketing executive':3.12,'Healthcare administrator':3.08,'Educator':3.05,'Student':3.12,'General consumer':2.62}
    shift={'Cybersecurity':0.35,'Artificial Intelligence':0.25,'FinTech':0.14,'Other':-0.12}.get(industry,0)
    return clamp(rng.gauss(role_center.get(role,3.0)+shift,0.95),1,5)

def score_and_label(latent):
    # The hidden competence latent variable (rather than directly copied questionnaire fields)
    # produces a simulated reference label. It is NOT measured ground truth.
    if latent <2.48: return 'Low'
    if latent <3.70: return 'Medium'
    return 'High'

def audience_text(role,market,industry,latent,geography):
    pieces=[f'{role.lower()}s' if role not in ['General consumer','Operations staff'] else ('everyday consumers' if role=='General consumer' else 'operations staff')]
    if industry=='Education Technology':pieces.append('using learning and administration tools')
    elif industry=='Healthcare Technology': pieces.append('using appointment and healthcare management tools')
    elif industry=='FinTech': pieces.append('handling day-to-day business payments or financial records')
    elif industry=='Cybersecurity': pieces.append('managing system access and information-security processes')
    else: pieces.append(rng.choice(['managing routine business tasks','exploring software to improve daily workflows','comparing digital service options']))
    literacy_behaviour= rng.choice((['often request step-by-step product demonstrations','prefer guided onboarding and plain-language examples'] if latent<2.6 else (['use common office apps and messaging tools','compare features before choosing software'] if latent<3.8 else ['review documentation and integration information','assess system workflows and configuration requirements'])))
    return f"{', '.join(pieces)}; {literacy_behaviour}; market area: {geography.lower()}"

def content_for_market(market,role,latent):
    weights={'Short videos':1.4,'Educational videos':1.35,'Images/graphics':1.35,'Articles/blogs':1.0,'Case studies':1.0,'Product demonstrations':1.4,'Customer testimonials':0.95}
    if market=='B2B':weights.update({'Case studies':2.0,'Product demonstrations':2.2,'Articles/blogs':1.3})
    if market=='B2C':weights.update({'Short videos':2.5,'Images/graphics':1.9,'Customer testimonials':1.4})
    if role=='Student':weights['Short videos']*=1.7
    if latent>3.7:weights['Case studies']*=1.5
    return choice_weighted(list(weights.items()))

def ch_audience(channel,market,role,industry,latent):
    match={
     'Facebook':{'B2B':0.66,'B2C':0.90,'Both':0.82},
     'Instagram':{'B2B':0.46,'B2C':0.88,'Both':0.69},
     'LinkedIn':{'B2B':0.93,'B2C':0.31,'Both':0.72},
     'TikTok':{'B2B':0.34,'B2C':0.85,'Both':0.62},
     'YouTube':{'B2B':0.71,'B2C':0.82,'Both':0.82},
     'Google Ads':{'B2B':0.84,'B2C':0.80,'Both':0.86},
     'Email Marketing':{'B2B':0.82,'B2C':0.56,'Both':0.72},
     'Website/SEO':{'B2B':0.88,'B2C':0.74,'Both':0.83},
    }[channel][market]
    if role in ['IT professional','Manager','Accountant'] and channel=='LinkedIn':match+=0.055
    if industry in ['Education Technology','Healthcare Technology'] and channel=='YouTube':match+=0.05
    if role=='Student' and channel=='TikTok':match+=0.08
    if latent>3.7 and channel in ['LinkedIn','Website/SEO','Email Marketing']:match+=0.025
    return clamp(match,0.12,0.99)

def goal_fit(channel,goal):
    lookup={
     'More website visitors':{'Website/SEO':0.97,'Google Ads':0.92,'Facebook':0.74,'YouTube':0.73,'LinkedIn':0.68,'Instagram':0.63,'TikTok':0.60,'Email Marketing':0.62},
     'More leads':{'LinkedIn':0.87,'Google Ads':0.94,'Email Marketing':0.88,'Website/SEO':0.91,'Facebook':0.77,'Instagram':0.67,'YouTube':0.63,'TikTok':0.54},
     'More sales':{'Google Ads':0.95,'Facebook':0.83,'Instagram':0.83,'Email Marketing':0.81,'Website/SEO':0.79,'LinkedIn':0.72,'TikTok':0.71,'YouTube':0.69},
     'More social media engagement':{'Facebook':0.93,'Instagram':0.94,'TikTok':0.96,'YouTube':0.88,'LinkedIn':0.71,'Google Ads':0.53,'Email Marketing':0.43,'Website/SEO':0.43},
     'More brand awareness':{'YouTube':0.90,'Facebook':0.95,'Instagram':0.86,'TikTok':0.94,'LinkedIn':0.69,'Google Ads':0.70,'Email Marketing':0.55,'Website/SEO':0.69}
    }
    return lookup[goal][channel]

def content_fit(channel,content):
    mapping={
     'Short videos':['TikTok','Instagram','YouTube','Facebook'],
     'Educational videos':['YouTube','Facebook','LinkedIn','Instagram'],
     'Images/graphics':['Instagram','Facebook','LinkedIn'],
     'Articles/blogs':['Website/SEO','LinkedIn','Email Marketing'],
     'Case studies':['LinkedIn','Website/SEO','Email Marketing'],
     'Product demonstrations':['YouTube','Google Ads','Website/SEO','LinkedIn'],
     'Customer testimonials':['Facebook','Instagram','YouTube','Website/SEO']
    }
    return 0.96 if channel in mapping[content][:2] else (0.78 if channel in mapping[content][2:] else 0.48)

def score_channels(market,role,industry,latent,content,goal,monthly_budget,location):
    scores={}
    for ch in CHANNELS:
        audience=ch_audience(ch,market,role,industry,latent)
        goal_f=goal_fit(ch,goal)
        co=CHANNEL_BASE[ch]['cost']
        if monthly_budget<20000 and ch in ['LinkedIn','Google Ads']:co*=0.73
        elif monthly_budget>170000 and ch in ['LinkedIn','Google Ads','YouTube']:co=min(0.92,co+0.11)
        reach=CHANNEL_BASE[ch]['reach']
        if location not in ['All Sri Lanka','Western Province'] and ch=='LinkedIn':reach*=0.88
        content_f=content_fit(ch,content)
        s=sum(AHP_WEIGHTS[k]*v for k,v in zip(AHP_WEIGHTS,[audience,goal_f,co,reach,content_f]))
        s=100*clamp(s+rng.gauss(0,0.035),0.1,0.99)
        scores[ch]=round(s,2)
    return scores

def chosen_used_channels(market,budget,goal):
    if rng.random()<0.07: return []
    weights={ch:0.8 for ch in CHANNELS}
    weights.update({'Facebook':2.5,'Instagram':1.4,'LinkedIn':1.3,'TikTok':1.1,'YouTube':1.0,'Google Ads':1.8,'Email Marketing':0.95,'Website/SEO':1.4})
    if market=='B2B':weights['LinkedIn']*=2.0;weights['Email Marketing']*=1.4
    if market=='B2C':weights['Instagram']*=1.9;weights['TikTok']*=1.6
    if budget<30000:weights['LinkedIn']*=0.6;weights['Google Ads']*=0.75
    return pick_unique(CHANNELS,rng.choices([1,2,3,4],[18,38,32,12],k=1)[0],weights)

def allocate(budget,scores):
    if budget==0:
        best=sorted(scores,key=scores.get,reverse=True)
        return best[:3],[0,0,0]
    count=2 if budget<15000 else 3
    best=sorted(scores,key=lambda x:(-scores[x],x))[:count]
    weights=[max(0.05,scores[ch]/100)**3 for ch in best]
    denominator=sum(weights)
    amounts=[int(round(budget*w/denominator/1000)*1000) for w in weights[:-1]]
    amounts.append(budget-sum(amounts))
    if any(x<0 for x in amounts):
        amounts=[int(budget*w/denominator) for w in weights[:-1]]
        amounts.append(budget-sum(amounts))
    while len(best)<3:best.append('Not selected');amounts.append(0)
    return best,amounts

def perceived_rating(latent,noise=0.65):
    return int(round(clamp(latent+rng.gauss(0,noise),1,5)))

def rule_baseline(q10,q11):
    av=(q10+q11)/2
    return 'Low' if av<2.5 else ('Medium' if av<3.75 else 'High')

def goal_target(goal,budget):
    unit,mn,mx=GOAL_KPI[goal]
    effect=clamp(math.sqrt((budget+1000)/80000),0.27,3.4)
    return unit,int(round(clamp(rng.lognormvariate(math.log(max(mn*1.5,math.sqrt(mn*mx)/3)),0.55)*effect,mn,mx)))

# Pre-assign 1000 synthetic company groups to avoid leakage in ML train/val/test.
profile_ids=list(range(1,N_PROFILES+1))
rng.shuffle(profile_ids)
splits={idx:('train' if i<750 else ('validation' if i<900 else 'test')) for i,idx in enumerate(profile_ids)}

RAW_HEADERS=['scenario_id','company_profile_id','campaign_variant','dataset_type','ml_split','respondent_role_synthetic','company_size_synthetic',
'Q1_product_service_name','Q2_product_description','Q3_main_features','Q4_industry','Q5_primary_target_customer',
'Q6_market_type','Q7_target_age_group','Q8_customer_occupation','Q9_target_location','Q10_technology_comfort','Q11_technical_terms_familiarity',
'Q12_message_detail_preference','Q13_main_customer_benefit','Q14_actual_customer_pain_points','Q15_current_marketing_channels',
'Q16_prior_best_channels','Q17_preferred_content','Q18_monthly_marketing_budget_LKR','Q19_budget_flexibility',
'Q20_campaign_duration','Q21_success_definition','audience_behavior_text','technical_comfort_score_1to5',
'technical_terms_score_1to5','simulated_technical_literacy_label','label_origin','campaign_primary_goal',
'goal_KPI_unit','synthetic_KPI_target_per_month','proposed_message_TEMPLATE_only', 'total_campaign_budget_LKR','provenance']
ML_HEADERS=['scenario_id','company_profile_id','ml_split','industry','market_type','customer_role','age_group','location',
'customer_audience_text','technology_comfort_1to5','technical_terms_familiarity_1to5','technical_literacy_reference_label_SIMULATED','rule_baseline_label',
'label_origin','forbidden_training_fields_note']
PLAN_HEADERS=['scenario_id','company_profile_id','ml_split','industry','market_type','campaign_goal','monthly_budget_LKR',
'campaign_months','total_campaign_budget_LKR','channel_1','channel_1_score_0to100','channel_1_monthly_LKR',
'channel_2','channel_2_score_0to100','channel_2_monthly_LKR','channel_3','channel_3_score_0to100',
'channel_3_monthly_LKR','unallocated_monthly_LKR','ranking_heuristic_version','is_real_observed_outcome']

raw_rows=[]; ml_rows=[]; plan_rows=[]
for profile_idx in range(1,N_PROFILES+1):
    ind=choice_weighted(list(INDUSTRY_WEIGHTS.items()))
    product_title,features,benefit,problem,roles,audience= rng.choice(DOMAINS[ind])
    market=assign_market(ind)
    role=assign_role(roles,market)
    age=age_for_role(role)
    location=choice_weighted([(x,(3.7 if x=='All Sri Lanka' else 3.4 if x=='Western Province' else 1.4 if x in ['Colombo','Gampaha','Kandy'] else 0.85)) for x in LOCATIONS])
    size=rng.choices(SECTOR_GROUPS,SECTOR_WEIGHTS,k=1)[0]
    profile_base=audience_latent(role,ind,size)
    name=f'{VOCAB[(profile_idx*7)%len(VOCAB)]} {product_title} {profile_idx:04d}'
    desc=f'{product_title} is a software-enabled solution intended for {audience}. It provides {features[0]}, {features[1]} and {features[2]} to help teams {benefit}. Technology is described at a functional level; no verified product claims are implied.'
    for campaign in range(1,SCENARIOS_PER_PROFILE+1):
        sid=f'SYN-{profile_idx:04d}-C{campaign}'
        latent=clamp(profile_base + rng.gauss(0,0.31),1,5)
        label=score_and_label(latent)
        q10=perceived_rating(latent,0.75)
        q11=perceived_rating(latent,0.73)
        q12=perceived_rating(latent,0.75)
        q12_name=LANGUAGES[q12-1]
        use_features=pick_unique(features,rng.choice([2,3,4]))
        budget=numeric_budget(size,ind)
        if rng.random()<0.025:budget=0
        months=rng.choices([1,3,6,9,12],[29,38,21,7,5],k=1)[0]
        duration= f'{months} months' if months<=6 else 'More than 6 months'
        flex=rng.choices(['Fixed budget','Slightly flexible','Moderately flexible','Highly flexible'],[35,30,25,10],k=1)[0]
        preferred=content_for_market(market,role,latent)
        goals=pick_unique(GOALS,rng.choices([1,2],[79,21],k=1)[0])
        main_goal=goals[0]
        used=chosen_used_channels(market,budget,main_goal)
        prior_best=pick_unique(used,rng.choice([1,1,1,2])) if used and rng.random()>0.13 else []
        score=score_channels(market,role,ind,latent,preferred,main_goal,budget,location)
        top,alloc=allocate(budget,score)
        pain_candidates=[problem]+pick_unique([p for p in PAINS if p.lower() not in problem.lower()],rng.choice([1,2]))
        behaviour=audience_text(role,market,ind,latent,location)
        q5=f'{audience.capitalize()}; primary contact: {role.lower()}'
        benefit_msg=benefit[0].upper()+benefit[1:]+'.'
        if q12>=4: msg=f'{product_title}: {benefit_msg} Features include {use_features[0]} and {use_features[1]}.'
        elif q12<=2:msg=f'Make daily tasks easier with {product_title}. {benefit_msg}'
        else:msg=f'{product_title} helps you {benefit}. Includes {use_features[0]}.'
        target_unit,target_value=goal_target(main_goal,budget)
        raw={
          'scenario_id':sid,'company_profile_id':f'SYNCO-{profile_idx:04d}','campaign_variant':campaign,
          'dataset_type':'SYNTHETIC_FICTIONAL_SCENARIO','ml_split':splits[profile_idx],
          'respondent_role_synthetic':rng.choice(['Founder / owner','Marketing manager','Product manager','Operations manager']),
          'company_size_synthetic':size,
          'Q1_product_service_name':name,'Q2_product_description':desc,'Q3_main_features':' | '.join(use_features),
          'Q4_industry':ind,'Q5_primary_target_customer':q5,'Q6_market_type':market,'Q7_target_age_group':age,
          'Q8_customer_occupation':role,'Q9_target_location':location,'Q10_technology_comfort':TECH_COMFORT[q10-1],
          'Q11_technical_terms_familiarity':TECH_TERMS[q11-1],'Q12_message_detail_preference':q12_name,
          'Q13_main_customer_benefit':benefit_msg,'Q14_actual_customer_pain_points':' | '.join(pain_candidates),
          'Q15_current_marketing_channels':' | '.join(used) if used else 'None currently',
          'Q16_prior_best_channels':' | '.join(prior_best) if prior_best else 'No performance data',
          'Q17_preferred_content':preferred,'Q18_monthly_marketing_budget_LKR':budget,
          'Q19_budget_flexibility':flex,'Q20_campaign_duration':duration,
          'Q21_success_definition':' | '.join(goals),
          'audience_behavior_text':behaviour,'technical_comfort_score_1to5':q10,'technical_terms_score_1to5':q11,
          'simulated_technical_literacy_label':label,'label_origin':'Simulated hidden aptitude; NOT expert/customer measured',
          'campaign_primary_goal':main_goal,'goal_KPI_unit':target_unit,'synthetic_KPI_target_per_month':target_value,
          'proposed_message_TEMPLATE_only':msg,'total_campaign_budget_LKR':budget*months,
          'provenance':'100% simulated; not a real respondent / not observed outcomes'
        }
        raw_rows.append(raw)
        ml_rows.append({
          'scenario_id':sid,'company_profile_id':raw['company_profile_id'],'ml_split':raw['ml_split'],
          'industry':ind,'market_type':market,'customer_role':role,'age_group':age,'location':location,
          'customer_audience_text':behaviour,
          'technology_comfort_1to5':q10,'technical_terms_familiarity_1to5':q11,
          'technical_literacy_reference_label_SIMULATED':label,'rule_baseline_label':rule_baseline(q10,q11),
          'label_origin':'SIMULATED_NOT_INDEPENDENT_GROUND_TRUTH',
          'forbidden_training_fields_note':'Do not use reference label, baseline label, Q12 or generator hidden aptitude as features'
        })
        plan_rows.append({
          'scenario_id':sid,'company_profile_id':raw['company_profile_id'],'ml_split':raw['ml_split'],
          'industry':ind,'market_type':market,'campaign_goal':main_goal,'monthly_budget_LKR':budget,
          'campaign_months':months,'total_campaign_budget_LKR':budget*months,
          'channel_1':top[0], 'channel_1_score_0to100':score[top[0]] if top[0] in score else 0,
          'channel_1_monthly_LKR':alloc[0],
          'channel_2':top[1], 'channel_2_score_0to100':score[top[1]] if top[1] in score else 0,
          'channel_2_monthly_LKR':alloc[1],
          'channel_3':top[2], 'channel_3_score_0to100':score[top[2]] if top[2] in score else 0,
          'channel_3_monthly_LKR':alloc[2],
          'unallocated_monthly_LKR':budget-sum(alloc),
          'ranking_heuristic_version':'Synthetic_AHP_style_v1_not_expert_elicited',
          'is_real_observed_outcome':'NO'
        })

for filename,cols,rows in [
 ('Marketing_Questionnaire_Synthetic_5000.csv',RAW_HEADERS,raw_rows),
 ('Audience_Classifier_ML_5000.csv',ML_HEADERS,ml_rows),
 ('Marketing_Channel_Budget_5000.csv',PLAN_HEADERS,plan_rows)]:
    with open(os.path.join(OUT,filename),'w',newline='',encoding='utf-8-sig') as f:
        w=csv.DictWriter(f,fieldnames=cols,extrasaction='ignore');w.writeheader();w.writerows(rows)

# validations
assert len(raw_rows)==len(ml_rows)==len(plan_rows)==5000
assert len({x['scenario_id'] for x in raw_rows})==5000
assert len({x['company_profile_id'] for x in raw_rows})==1000
assert all(row['total_campaign_budget_LKR']==row['Q18_monthly_marketing_budget_LKR']*int(plan_rows[i]['campaign_months']) for i,row in enumerate(raw_rows))
assert all(r['monthly_budget_LKR']==r['channel_1_monthly_LKR']+r['channel_2_monthly_LKR']+r['channel_3_monthly_LKR']+r['unallocated_monthly_LKR'] for r in plan_rows)
assert all((r['Q16_prior_best_channels']=='No performance data' or set(r['Q16_prior_best_channels'].split(' | ')).issubset(set(r['Q15_current_marketing_channels'].split(' | ')))) for r in raw_rows)
assert all(0<=r['channel_1_score_0to100']<=100 for r in plan_rows)
assert all(x['scenario_id']==y['scenario_id']==z['scenario_id'] for x,y,z in zip(raw_rows,ml_rows,plan_rows))
split_groups=defaultdict(set)
for x in raw_rows:split_groups[x['ml_split']].add(x['company_profile_id'])
assert not split_groups['train'] & split_groups['test']
assert not split_groups['train'] & split_groups['validation']
assert not split_groups['validation'] & split_groups['test']

stats={
 'generated_at':'2026-10-20', 'seed':SEED, 'records':len(raw_rows),'fictional_company_profiles':N_PROFILES,
 'campaign_scenarios_per_profile':SCENARIOS_PER_PROFILE,
 'provenance':'Entire dataset synthetic; no primary responses, observed campaign outcomes, validated labels, or expert judgements.',
 'split_counts':dict(Counter(r['ml_split'] for r in raw_rows)),
 'industry_counts':dict(Counter(r['Q4_industry'] for r in raw_rows)),
 'literacy_counts':dict(Counter(r['simulated_technical_literacy_label'] for r in raw_rows)),
 'market_counts':dict(Counter(r['Q6_market_type'] for r in raw_rows)),
 'zero_budget_count':sum(r['Q18_monthly_marketing_budget_LKR']==0 for r in raw_rows),
 'median_budget_LKR':statistics.median(r['Q18_monthly_marketing_budget_LKR'] for r in raw_rows),
 'mean_budget_LKR':round(statistics.mean(r['Q18_monthly_marketing_budget_LKR'] for r in raw_rows)),
 'allocation_mismatches':sum(r['unallocated_monthly_LKR']!=0 for r in plan_rows),
 'channel_top1_counts':dict(Counter(r['channel_1'] for r in plan_rows)),
 'baseline_rule_agreement_rate':round(sum(m['rule_baseline_label']==m['technical_literacy_reference_label_SIMULATED'] for m in ml_rows)/len(ml_rows),4),
 'evidence_urls':['https://datareportal.com/reports/digital-2026-sri-lanka','https://www.srilankabusiness.com/news/sri-lankas-export-performance-exceeded-us-17.2-billion-in-2025.html','https://www.icta.lk/icta-assets/uploads/2023/05/Annex-1-National-Digital-Strategy-2030.pdf'],
 'limitation':'External source data informs broad context only. Synthetic row frequencies, prices, channel scores, AHP-style weights and class priors are author assumptions, not observed Sri Lankan market estimates.'
}
with open(f'{OUT}/Dataset_Generation_Audit.json','w',encoding='utf-8') as f:json.dump(stats,f,indent=2,ensure_ascii=False)

with open(f'{OUT}/Dataset_Data_Dictionary.csv','w',newline='',encoding='utf-8-sig') as f:
    w=csv.writer(f);w.writerow(['file','field','meaning','role_in_model','source_or_derivation'])
    for field in RAW_HEADERS:
        tag='original questionnaire field (Q1-Q21)' if field.startswith('Q') else 'supplementary synthetic field'
        role=('target / exclude from training' if field=='simulated_technical_literacy_label' else
              ('exclude from model features' if field in ['label_origin','provenance','dataset_type','ml_split'] else 'context / scenario input'))
        w.writerow(['Marketing_Questionnaire_Synthetic_5000.csv',field,field.replace('_',' '),role,tag])
    for field in ML_HEADERS:
        role='EXCLUDE target leakage' if 'reference_label' in field or field in ['rule_baseline_label','label_origin','forbidden_training_fields_note','company_profile_id','scenario_id','ml_split'] else 'candidate feature'
        w.writerow(['Audience_Classifier_ML_5000.csv',field,field.replace('_',' '),role,'derived from synthetic scenario generator'])
    for field in PLAN_HEADERS:
        role='computed illustrative recommendation' if ('channel_' in field or 'unallocated' in field) else 'campaign input or identifier'
        w.writerow(['Marketing_Channel_Budget_5000.csv',field,field.replace('_',' '),role,'illustrative heuristics, not actual performance'])

print(json.dumps(stats,ensure_ascii=False,indent=2))
