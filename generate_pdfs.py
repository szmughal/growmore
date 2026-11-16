import os
import re
import asyncio
import markdown
from playwright.async_api import async_playwright

DOCS = [
    {
        "md_path": r"C:\Users\user\.gemini\antigravity\brain\eea53a39-d22b-46a9-a2d9-db4343f597ea\GROW_MORE_TECHNICAL_ARCHITECTURE_AND_DATA_SPECIFICATION.md",
        "output_pdf_workspace": r"d:\Testing App\Grow more\Grow_More_Technical_Architecture_and_Data_Specification.pdf",
        "output_pdf_artifact": r"C:\Users\user\.gemini\antigravity\brain\eea53a39-d22b-46a9-a2d9-db4343f597ea\Grow_More_Technical_Architecture_and_Data_Specification.pdf",
        "subtitle": "Engineering & Data Architecture Specification",
        "category": "TECHNICAL SPECIFICATION"
    },
    {
        "md_path": r"C:\Users\user\.gemini\antigravity\brain\eea53a39-d22b-46a9-a2d9-db4343f597ea\GROW_MORE_USER_GUIDE_AND_UI_WALKTHROUGH.md",
        "output_pdf_workspace": r"d:\Testing App\Grow more\Grow_More_User_Guide_and_UI_Walkthrough.pdf",
        "output_pdf_artifact": r"C:\Users\user\.gemini\antigravity\brain\eea53a39-d22b-46a9-a2d9-db4343f597ea\Grow_More_User_Guide_and_UI_Walkthrough.pdf",
        "subtitle": "Complete User Guide & UI Walkthrough",
        "category": "INVESTOR HANDBOOK"
    }
]

CSS_STYLES = """
@page {
    size: A4;
    margin: 20mm 16mm 22mm 16mm;
    @top-right {
        content: "Grow More | PSX Financial Intelligence";
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 8pt;
        color: #64748b;
    }
    @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 8.5pt;
        color: #94a3b8;
    }
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    font-size: 10pt;
    margin: 0;
    padding: 0;
    background-color: #ffffff;
}

.document-header {
    border-bottom: 2px solid #0f172a;
    padding-bottom: 16px;
    margin-bottom: 24px;
}

.badge {
    display: inline-block;
    background-color: #059669;
    color: #ffffff;
    font-size: 7.5pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    margin-bottom: 10px;
}

h1 {
    font-size: 20pt;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 8px 0;
    line-height: 1.25;
}

.meta-bar {
    font-size: 9pt;
    color: #64748b;
    margin-top: 4px;
}

h2 {
    font-size: 13.5pt;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 5px;
    margin-top: 24px;
    margin-bottom: 12px;
    page-break-after: avoid;
}

h3 {
    font-size: 11.5pt;
    font-weight: 600;
    color: #1e293b;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
}

h4 {
    font-size: 10.5pt;
    font-weight: 600;
    color: #334155;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
}

p {
    margin: 0 0 10px 0;
}

ul, ol {
    margin: 0 0 12px 0;
    padding-left: 20px;
}

li {
    margin-bottom: 4px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 18px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
}

th, td {
    border: 1px solid #cbd5e1;
    padding: 7px 10px;
    text-align: left;
    vertical-align: top;
}

th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
}

tr:nth-child(even) td {
    background-color: #f8fafc;
}

pre, code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

code {
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 8.5pt;
}

pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 12px 14px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 8pt;
    line-height: 1.45;
    margin: 12px 0 16px 0;
    page-break-inside: avoid;
}

pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    border-radius: 0;
    font-size: inherit;
}

/* Callout Alert Boxes */
.alert {
    padding: 10px 14px;
    border-radius: 6px;
    margin: 14px 0;
    font-size: 9pt;
    page-break-inside: avoid;
}

.alert-tip {
    background-color: #ecfdf5;
    border-left: 4px solid #059669;
    color: #065f46;
}

.alert-important {
    background-color: #f5f3ff;
    border-left: 4px solid #7c3aed;
    color: #4c1d95;
}

.alert-warning {
    background-color: #fffbeb;
    border-left: 4px solid #d97706;
    color: #92400e;
}

.alert-note {
    background-color: #f0fdfa;
    border-left: 4px solid #0d9488;
    color: #115e59;
}

.alert strong {
    font-weight: 700;
}

hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 20px 0;
}

.footer-stamp {
    margin-top: 30px;
    border-top: 1px solid #e2e8f0;
    padding-top: 10px;
    font-size: 8pt;
    color: #94a3b8;
    text-align: right;
}
"""

def parse_markdown_to_html(md_text, category, subtitle):
    # Process Github style alerts: > [!NOTE], > [!IMPORTANT], > [!TIP], > [!WARNING]
    def replace_alerts(match):
        alert_type = match.group(1).lower()
        content = match.group(2).strip()
        # Clean lines starting with >
        lines = [re.sub(r"^>\s?", "", line) for line in content.split("\n")]
        body = "\n".join(lines).strip()
        css_class = f"alert-{alert_type}"
        title = alert_type.upper()
        return f'<div class="alert {css_class}"><strong>{title}:</strong><br/>{body}</div>'

    md_text = re.sub(
        r">\s*\[!(NOTE|IMPORTANT|TIP|WARNING)\]\s*([\s\S]*?)(?=(?:\n\n|\n(?=[^>])|$))",
        replace_alerts,
        md_text
    )

    # Convert markdown to html
    html_content = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "nl2br"]
    )

    # Wrap in complete standalone HTML page
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{subtitle}</title>
    <style>
{CSS_STYLES}
    </style>
</head>
<body>
    <div class="document-header">
        <span class="badge">{category}</span>
        <h1>{subtitle}</h1>
        <div class="meta-bar">Grow More Financial Intelligence Platform &bull; Pakistan Stock Exchange (PSX) &bull; Official Release</div>
    </div>
    
    <div class="content">
{html_content}
    </div>

    <div class="footer-stamp">
        Generated for Grow More Platform &bull; Verified Production Build 1.0.0
    </div>
</body>
</html>"""
    return full_html


async def generate_pdfs():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for doc in DOCS:
            md_path = doc["md_path"]
            with open(md_path, "r", encoding="utf-8") as f:
                md_content = f.read()

            html = parse_markdown_to_html(md_content, doc["category"], doc["subtitle"])
            
            # Temporary html file
            temp_html_path = md_path.replace(".md", ".temp.html")
            with open(temp_html_path, "w", encoding="utf-8") as f:
                f.write(html)

            page = await browser.new_page()
            await page.goto(f"file:///{temp_html_path.replace(os.sep, '/')}")
            await page.wait_for_load_state("networkidle")

            # Generate PDF to workspace
            await page.pdf(
                path=doc["output_pdf_workspace"],
                format="A4",
                print_background=True,
                margin={"top": "18mm", "bottom": "18mm", "left": "15mm", "right": "15mm"}
            )
            print(f"Generated PDF (Workspace): {doc['output_pdf_workspace']}")

            # Copy or generate to artifact directory
            await page.pdf(
                path=doc["output_pdf_artifact"],
                format="A4",
                print_background=True,
                margin={"top": "18mm", "bottom": "18mm", "left": "15mm", "right": "15mm"}
            )
            print(f"Generated PDF (Artifact): {doc['output_pdf_artifact']}")

            await page.close()
            if os.path.exists(temp_html_path):
                os.remove(temp_html_path)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(generate_pdfs())
