# ChandraHoro Licensing Guide

## License

**ChandraHoro** is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

See the [LICENSE](LICENSE) file for the full license text.

---

## What This Means for You

### ✅ **You CAN:**

1. **Use ChandraHoro for free** - No licensing fees
2. **Run the software** - For personal or commercial purposes
3. **Study the source code** - Full transparency
4. **Modify the software** - Customize to your needs
5. **Distribute copies** - Share with others
6. **Charge for services** - Hosting, support, consulting, premium features
7. **Build a business** - Like GitLab, Nextcloud, Grafana (all AGPL-3.0)

### ⚠️ **You MUST:**

1. **Provide source code** - To all users of your service
2. **Use AGPL-3.0 license** - For any modifications
3. **Include copyright notices** - In all copies
4. **Disclose modifications** - If you change the code
5. **Provide installation instructions** - For users to run modified versions

### ❌ **You CANNOT:**

1. **Keep modifications private** - If you provide the service to others
2. **Use a different license** - For derivative works
3. **Remove copyright notices** - From the source code

---

## Business Models Compatible with AGPL-3.0

### ✅ **Successful Examples:**

| Company | Product | License | Business Model |
|---------|---------|---------|----------------|
| **GitLab** | DevOps Platform | AGPL-3.0 | Open core + SaaS + Enterprise |
| **Nextcloud** | File Sync & Share | AGPL-3.0 | Support + Hosting + Enterprise |
| **Grafana** | Monitoring Platform | AGPL-3.0 | Cloud + Enterprise + Support |
| **Mattermost** | Team Chat | AGPL-3.0 | Cloud + Enterprise features |

### 💰 **Revenue Streams:**

1. **SaaS/Hosting** - Charge for managed hosting (✅ Allowed)
2. **Support Services** - Premium support contracts (✅ Allowed)
3. **Consulting** - Implementation, customization (✅ Allowed)
4. **Training** - Workshops, courses (✅ Allowed)
5. **Premium Features** - Non-GPL add-ons (✅ Allowed with dual licensing)
6. **Enterprise Edition** - Additional features for large organizations (✅ Allowed)

---

## Why AGPL-3.0?

### **Reason 1: pyswisseph Dependency**

ChandraHoro uses **pyswisseph** (Swiss Ephemeris) for astronomical calculations, which is licensed under AGPL-3.0. This means:

- We are **required** to use AGPL-3.0 (or compatible license)
- Alternative: Purchase Swiss Ephemeris Professional License (~$500-2000 one-time fee)

### **Reason 2: Community Benefits**

- **Transparency** - Users can verify calculation accuracy
- **Contributions** - Community can improve the software
- **Trust** - Open source builds user confidence
- **Innovation** - Shared improvements benefit everyone

### **Reason 3: Business Advantages**

- **No licensing costs** - Free to use and distribute
- **Competitive advantage** - Open source attracts users
- **Ecosystem growth** - Plugins, integrations, extensions
- **Marketing** - "Open source" is a selling point

---

## Dependencies and Their Licenses

| Dependency | License | Commercial Use | Notes |
|------------|---------|----------------|-------|
| **pyswisseph** | AGPL-3.0 | ✅ Yes (with compliance) | Astronomical calculations |
| **FastAPI** | MIT | ✅ Yes | Web framework |
| **React** | MIT | ✅ Yes | Frontend framework |
| **Next.js** | MIT | ✅ Yes | React framework |
| **SQLAlchemy** | MIT | ✅ Yes | Database ORM |
| **MySQL** | GPL-2.0 | ✅ Yes (client library exception) | Database |

**Net Effect:** AGPL-3.0 (most restrictive license applies)

---

## Compliance Checklist

### ✅ **For ChandraHoro Developers:**

- [x] Add LICENSE file to repository root
- [x] Add copyright headers to source files
- [x] Provide source code via GitHub
- [ ] Add "Source Code" link in web application footer
- [ ] Document installation instructions
- [ ] Include AGPL-3.0 notice in About page

### ✅ **For Users/Deployers:**

- [ ] Keep LICENSE file in deployments
- [ ] Provide source code link to end users
- [ ] Include copyright notices in UI
- [ ] Disclose any modifications made
- [ ] Use AGPL-3.0 for derivative works

---

## Frequently Asked Questions

### **Q: Can I charge for ChandraHoro?**

**A:** Yes! You can charge for:
- Hosting/SaaS services
- Support and consulting
- Training and workshops
- Premium features (if dual-licensed)

You **cannot** charge for the software itself without providing source code.

### **Q: Can I keep my modifications private?**

**A:** No, if you provide the service to others over a network (web app, API), you must provide the source code including modifications.

### **Q: Can I use ChandraHoro in a commercial product?**

**A:** Yes, but your entire product must be licensed under AGPL-3.0 and source code must be provided to users.

### **Q: What if I want to keep my code proprietary?**

**A:** You would need to:
1. Purchase Swiss Ephemeris Professional License from Astrodienst
2. Rewrite or replace any AGPL-3.0 dependencies
3. Use a different license for your code

### **Q: Can I create a mobile app with ChandraHoro?**

**A:** Yes, but the app must be licensed under AGPL-3.0 and source code must be provided to users.

### **Q: Can I sell ChandraHoro on app stores?**

**A:** Yes, but you must provide source code and comply with AGPL-3.0. Some app stores (like Apple App Store) have restrictions on GPL software.

---

## Getting Help

### **Legal Questions:**
- Consult with a lawyer familiar with open source licensing
- Free Software Foundation: https://www.fsf.org/licensing/
- Software Freedom Law Center: https://softwarefreedom.org/

### **Technical Questions:**
- GitHub Issues: [Your Repository URL]
- Community Forum: [Your Forum URL]
- Email: [Your Support Email]

---

## Additional Resources

- **AGPL-3.0 Full Text:** https://www.gnu.org/licenses/agpl-3.0.html
- **AGPL-3.0 FAQ:** https://www.gnu.org/licenses/gpl-faq.html
- **Swiss Ephemeris:** https://www.astro.com/swisseph/
- **GitLab Open Core Model:** https://about.gitlab.com/company/stewardship/
- **Nextcloud Business Model:** https://nextcloud.com/pricing/

---

**Last Updated:** 2025-01-23  
**License Version:** AGPL-3.0  
**Copyright:** © 2025 ChandraHoro Development Team

