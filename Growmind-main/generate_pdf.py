import sys
from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 20)
        self.set_text_color(165, 42, 42) # Maroon
        self.cell(0, 10, 'GrowMind - Presentation Content & Prompt', 0, 1, 'C')
        self.ln(10)

    def chapter_title(self, title):
        self.set_font('helvetica', 'B', 16)
        self.set_fill_color(241, 245, 249) # Light grey background
        self.set_text_color(30, 41, 59) # Dark text
        self.cell(0, 10, title, 0, 1, 'L', 1)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('helvetica', '', 12)
        self.set_text_color(51, 65, 85)
        self.multi_cell(0, 8, body)
        self.ln(10)

def main():
    pdf = PDF()
    pdf.add_page()

    # Introduction & Prompt
    pdf.chapter_title('Prompt for Gemini / Canva')
    pdf.chapter_body(
        "Copy and paste the prompt below into Canva's Magic Design or Gemini to generate your presentation slides automatically:\n\n"
        "\"Create a professional 10-slide academic presentation for a computer science Final Year Project called 'GrowMind'. "
        "The project is a gamified focus and productivity app that combines a Pomodoro timer with an interactive 3D virtual garden. "
        "The design aesthetic should be cinematic, modern, and premium, utilizing dark backgrounds with emerald green (#10b981), "
        "purple (#a855f7), amber (#f59e0b), and maroon (#a52a2a) accents. Please use the exact slide content provided below.\""
    )

    content = [
        (
            "Slide 1: Title Slide",
            "GrowMind\n"
            "A Gamified Focus and Productivity App Using a Pomodoro Timer and a Virtual 3D Garden\n\n"
            "By: Izz Bin Ismail\n"
            "Supervisor: Ms Norizan Binti Johari\n"
            "Faculty of Engineering, Built Environment, and Information Technology"
        ),
        (
            "Slide 2: Abstract",
            "- Identifies the core problem: student distraction and lack of focus.\n"
            "- Solution: Integrates a Pomodoro timer with a reward system.\n"
            "- Gamification: Users build and nurture a virtual 3D garden through focused study sessions.\n"
            "- Impact: Positive reinforcement encourages sustained concentration and boosts productivity."
        ),
        (
            "Slide 3: Problem Statement",
            "1. Delayed Gratification\n"
            "   - Academic success lacks immediate rewards.\n"
            "2. Digital Fragmentation\n"
            "   - Constant context-switching between study and digital entertainment.\n"
            "3. Academic Isolation\n"
            "   - The lack of community presence during solitary study sessions."
        ),
        (
            "Slide 4: Project Objectives",
            "1. Develop a Pomodoro-style focus timer for study sessions.\n"
            "2. Implement an immersive virtual 3D garden that evolves based on real-time focus.\n"
            "3. Create a coin-based reward system for successful focus cycles.\n"
            "4. Enable user authentication and seamless progress tracking."
        ),
        (
            "Slide 5: Methodology",
            "Agile Development Methodology\n\n"
            "- Planning: Scoping the core MVP.\n"
            "- Design: UI/UX layout and 3D environment architecture.\n"
            "- Implementation: Building the React Native frontend and Supabase backend.\n"
            "- Testing: Unit tests and continuous performance checks (60 FPS).\n"
            "- Deployment: Cross-platform binaries via Expo.\n"
            "- Analysis: Gathering user feedback for iteration."
        ),
        (
            "Slide 6: Technical Stack",
            "- Platform Architecture: Native Mobile App (React Native + Expo SDK 52).\n"
            "- 3D Engine: React Three Fiber (R3F) via expo-gl + Custom Shaders.\n"
            "- Design System: Native Components with HSL tokens (No Tailwind).\n"
            "- Backend & Auth: Supabase (PostgreSQL + Row Level Security).\n"
            "- AI Engine: Google Gemini Pro via Supabase Edge Functions.\n"
            "- Realtime: Supabase Realtime synchronization for community features."
        ),
        (
            "Slide 7: Core Features",
            "- Focus Session Timer: Highly customizable intervals with Strict Mode.\n"
            "- Interactive 3D Garden: Trees grow organically through dedicated focus time.\n"
            "- GrowMind AI Coach: Context-aware academic assistant using Gemini.\n"
            "- Gamified Economy: Earn coins to purchase distinct plant typologies."
        ),
        (
            "Slide 8: User Interface Highlights",
            "(Placeholder for screenshots)\n\n"
            "Visual assets to include in your presentation:\n"
            "- App Dashboard & Task Manager\n"
            "- Pomodoro Timer View\n"
            "- Garden Progress Visualization\n"
            "- Coin Store & Customization\n"
            "- Profile & Analytics"
        ),
        (
            "Slide 9: Commercialisation Potential",
            "- Freemium Models: Basic features are free; premium garden elements require payment.\n"
            "- Institutional Licensing: Customized variants for universities and specialized study centers.\n"
            "- In-App Purchases: Specialized architectural 3D assets and limited-time trees.\n"
            "- Data Insights: Macro-level analytics on student productivity trends."
        ),
        (
            "Slide 10: Conclusion & Future Work",
            "Conclusion:\n"
            "- Successfully merged gamification with focus tools, yielding increased engagement.\n\n"
            "Future Work:\n"
            "- Deeper social features and global leaderboards.\n"
            "- Advanced analytics for precise study pattern optimization.\n"
            "- Full cross-platform availability across web and desktop."
        )
    ]

    for title, body in content:
        pdf.chapter_title(title)
        pdf.chapter_body(body)

    out_path = 'c:/Users/daniel/Desktop/growmind/GrowMind_Canva_Prompt.pdf'
    pdf.output(out_path)
    print(f"PDF successfully generated at: {out_path}")

if __name__ == "__main__":
    main()
