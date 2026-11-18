"use client";

import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";

// Configure pdfjs worker dynamically matching the installed pdfjs version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FlipbookViewerProps {
  fileUrl: string;
}

export default function FlipbookViewer({ fileUrl }: FlipbookViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const flipBookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoaded(true);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load failed", error);
    toast.error("Gagal memuat berkas PDF komik.");
  };

  const handleNextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const handlePrevPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const onPage = (e: any) => {
    setCurrentPage(e.data);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const pageWidth = isFullscreen ? 480 : 360;
  const pageHeight = isFullscreen ? 680 : 520;

  return (
    <div className="flex flex-col items-center gap-4 w-full" ref={containerRef}>
      {/* Viewer Container */}
      <div className={`relative w-full flex items-center justify-center bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-2xl transition-all ${isFullscreen ? "fixed inset-0 z-50 h-screen w-screen rounded-none border-none p-4 md:p-8" : "min-h-[500px]"}`}>
        {/* Fullscreen & Zoom Actions */}
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8 bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 text-zinc-300"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Loading Spinner */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950 z-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-zinc-400 font-medium">Memuat halaman komik...</p>
          </div>
        )}

        {/* PDF Document Loader */}
        <div className="overflow-hidden flex items-center justify-center max-h-full">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
          >
            {isLoaded && numPages > 0 && (
              <HTMLFlipBook
                key={isFullscreen ? "fullscreen" : "normal"}
                width={pageWidth}
                height={pageHeight}
                size="fixed"
                minWidth={300}
                maxWidth={650}
                minHeight={450}
                maxHeight={900}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                onFlip={onPage}
                ref={flipBookRef}
                className="shadow-2xl"
                style={{}}
                startPage={currentPage}
                drawShadow={true}
                flippingTime={1000}
                usePortrait={true}
                startZIndex={0}
                autoSize={true}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={false}
                disableFlipByClick={false}
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div key={`page_${index + 1}`} className="bg-white border-zinc-200 shadow-inner flex items-center justify-center overflow-hidden" style={{ width: pageWidth, height: pageHeight }}>
                    <Page
                      pageNumber={index + 1}
                      width={pageWidth}
                      height={pageHeight}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      loading={null}
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            )}
          </Document>
        </div>

        {/* Floating Navigation Controls */}
        {isLoaded && (
          <>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed z-10 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed z-10 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Fullscreen Page Indicator */}
        {isFullscreen && isLoaded && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
            Halaman {currentPage + 1} dari {numPages}
          </div>
        )}
      </div>

      {/* Normal Pages indicator */}
      {!isFullscreen && isLoaded && (
        <p className="text-sm font-semibold text-muted-foreground">
          Halaman {currentPage + 1} dari {numPages}
        </p>
      )}
    </div>
  );
}
