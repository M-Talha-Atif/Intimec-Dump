import { CheckCircle2, ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { documentationSections, type DocTopic, type DocScreenshot } from '@/data/documentation-content';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from "next/image";

interface DocumentationContentProps {
  activeTopicId: string;
}

const ScreenshotBlock = ({ screenshot }: { screenshot: DocScreenshot }) => (
  <figure className="my-6">
    <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
      {/* Wrapper must be relative + have height for fill to work */}
      <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
        <Image
          src={screenshot.src}
          alt={screenshot.alt}
          width={1920}
          height={1080}
          className="w-full h-auto object-contain"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
      </div>
    </div>
    <figcaption className="mt-2 text-xs text-muted-foreground text-center italic">
      {screenshot.caption}
    </figcaption>
  </figure>
);

const DocumentationContent = ({ activeTopicId }: DocumentationContentProps) => {
  let activeTopic: DocTopic | undefined;
  let sectionTitle = '';

  for (const section of documentationSections) {
    const found = section.topics.find(t => t.id === activeTopicId);
    if (found) {
      activeTopic = found;
      sectionTitle = section.title;
      break;
    }
  }

  if (!activeTopic) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a topic from the sidebar to view documentation.
      </div>
    );
  }

  const screenshotsByParagraph = new Map<number, DocScreenshot[]>();
  if (activeTopic.screenshots) {
    for (const ss of activeTopic.screenshots) {
      const idx = ss.afterParagraph ?? 0;
      if (!screenshotsByParagraph.has(idx)) screenshotsByParagraph.set(idx, []);
      screenshotsByParagraph.get(idx)!.push(ss);
    }
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="p-6 lg:p-10">
        <div className="mb-1">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {sectionTitle}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {activeTopic.title}
        </h2>

        <div className="space-y-4">
          {activeTopic.content.map((paragraph, idx) => (
            <div key={idx}>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
              {screenshotsByParagraph.get(idx + 1)?.map((ss, ssIdx) => (
                <ScreenshotBlock key={ssIdx} screenshot={ss} />
              ))}
            </div>
          ))}
        </div>

        {activeTopic.keyPoints && activeTopic.keyPoints.length > 0 && (
          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-5 pb-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Key Points</h3>
              <ul className="space-y-2">
                {activeTopic.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default DocumentationContent;
