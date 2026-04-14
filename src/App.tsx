import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Download, 
  Palette, 
  User, 
  Type as TypeIcon, 
  Image as ImageIcon,
  Loader2,
  Send,
  RefreshCw,
  X,
  Shield,
  Search,
  CheckCircle2,
  Circle,
  ArrowRight,
  Heart,
  Trash2,
  Bookmark,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { 
  generatePagePrompts, 
  generateColoringImage, 
  chatWithGemini
} from "@/services/geminiService";
import { createColoringBookPDF } from "@/services/pdfService";
import { 
  ColoringPage, 
  SafetySettings, 
  SavedConfig, 
  GenerationStep 
} from "@/types";
import { HarmBlockThreshold } from "@google/genai";
import { useFavorites } from "@/hooks/useFavorites";
import confetti from "canvas-confetti";

export default function App() {
  const [childName, setChildName] = useState("");
  const [theme, setTheme] = useState("");
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [userApiKey, setUserApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  
  const [currentStep, setCurrentStep] = useState<GenerationStep>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const { savedConfigs, saveConfig, deleteConfig } = useFavorites();

  const handleLoadConfig = (config: SavedConfig) => {
    setChildName(config.childName);
    setTheme(config.theme);
    toast.info(`Loaded: ${config.theme} for ${config.childName}`);
  };

  const handleDeleteConfig = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConfig(id);
  };
  
  const [safetySettings, setSafetySettings] = useState<SafetySettings>({
    harassment: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    hateSpeech: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    sexuallyExplicit: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    dangerousContent: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  });
  
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [coverPage, setCoverPage] = useState<{ title: string; description: string; imageUrl?: string; status?: string } | null>(null);
  const [pages, setPages] = useState<ColoringPage[]>([]);
  
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleGeneratePrompts = async () => {
    if (!childName || !theme) return;
    setIsGeneratingPrompts(true);
    setCurrentStep('brainstorming');
    setGenerationProgress(10);
    
    try {
      const data = await generatePagePrompts(theme, childName, safetySettings);
      setCoverPage({ ...data.cover, imageUrl: undefined, status: 'idle' });
      setPages(data.pages.map((p: any, i: number) => ({
        id: `page-${i}`,
        title: p.title,
        prompt: p.description,
        status: 'idle',
        difficulty: p.difficulty_level,
        subject: p.dominant_subject
      })));
      setGenerationProgress(25);
      toast.success("Book plan generated! Now let's create the art.");
    } catch (error) {
      console.error("Error generating prompts:", error);
      toast.error("Failed to generate book plan. Please try a different theme.");
      setCurrentStep('idle');
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  const handleGenerateImage = async (index: number | 'cover') => {
    if (!userApiKey) {
      setShowApiKeyInput(true);
      toast.error("API Key Required", {
        description: "Please set your Gemini API Key to generate high-quality images."
      });
      return;
    }
    
    try {
      if (index === 'cover') {
        if (!coverPage) return;
        setCoverPage(prev => prev ? { ...prev, status: 'generating' } : null);
        const url = await generateColoringImage(coverPage.description, imageSize, userApiKey, safetySettings);
        setCoverPage(prev => prev ? { ...prev, imageUrl: url, status: 'completed' } : null);
      } else {
        setPages(prev => prev.map((p, i) => i === index ? { ...p, status: 'generating' } : p));
        
        const url = await generateColoringImage(pages[index].prompt, imageSize, userApiKey, safetySettings);
        
        setPages(prev => prev.map((p, i) => i === index ? { ...p, imageUrl: url, status: 'completed' } : p));
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Image Generation Failed", {
        description: error instanceof Error ? error.message : "The AI might have flagged the content or the service is busy."
      });
      if (index === 'cover') {
        setCoverPage(prev => prev ? { ...prev, status: 'error' } : null);
      } else {
        setPages(prev => prev.map((p, i) => i === index ? { ...p, status: 'error' } : p));
      }
    }
  };

  const handleGenerateAllImages = async () => {
    if (!coverPage && pages.length === 0) return;
    setCurrentStep('sketching');
    
    let completedCount = 0;
    const total = (coverPage ? 1 : 0) + pages.length;

    const updateProgress = () => {
      completedCount++;
      setGenerationProgress(25 + (completedCount / total) * 50);
    };

    if (coverPage && !coverPage.imageUrl) {
      await handleGenerateImage('cover');
      updateProgress();
    }
    
    for (let i = 0; i < pages.length; i++) {
      if (!pages[i].imageUrl) {
        await handleGenerateImage(i);
        updateProgress();
      }
    }
    
    if (imageSize !== '1K') {
      setCurrentStep('upscaling');
      setGenerationProgress(85);
      await new Promise(r => setTimeout(r, 1500)); // Simulated upscaling time
    }
    
    setGenerationProgress(90);
    setCurrentStep('binding');
    toast.success("All images ready! Your book is bound and ready to download.");
  };

  const handleDownloadPDF = async () => {
    if (!coverPage?.imageUrl || pages.some(p => !p.imageUrl)) {
      toast.error("Incomplete Book", {
        description: "Please generate all images before downloading."
      });
      return;
    }
    
    setGenerationProgress(100);
    await createColoringBookPDF(
      childName,
      theme,
      coverPage.imageUrl,
      pages.map(p => ({ title: p.title, imageUrl: p.imageUrl! }))
    );
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    toast.success("PDF Downloaded!", {
      description: "Enjoy coloring with " + childName + "!"
    });
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;
    
    const newMessages = [...chatMessages, { role: 'user' as const, parts: [{ text: currentInput }] }];
    setChatMessages(newMessages);
    setCurrentInput("");
    setIsChatLoading(true);
    
    try {
      const response = await chatWithGemini(newMessages, useSearch, safetySettings);
      setChatMessages([...newMessages, { role: 'model' as const, parts: [{ text: response }] }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Assistant Error", {
        description: "Failed to get a response. Please try again."
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const getSafetyLabel = (val: HarmBlockThreshold) => {
    switch(val) {
      case HarmBlockThreshold.BLOCK_NONE: return "None";
      case HarmBlockThreshold.BLOCK_ONLY_HIGH: return "High Only";
      case HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE: return "Medium+";
      case HarmBlockThreshold.BLOCK_LOW_AND_ABOVE: return "Low+";
      default: return "Default";
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <Palette size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ColorJoy <span className="text-orange-500">AI</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger render={
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
                      <History size={20} />
                    </Button>
                  } />
                } />
                <TooltipContent>Saved Themes</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Favorite Themes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {savedConfigs.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No saved themes yet.
                  </div>
                ) : (
                  savedConfigs.map((config) => (
                    <DropdownMenuItem 
                      key={config.id} 
                      onClick={() => handleLoadConfig(config)}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium truncate">{config.theme}</span>
                        <span className="text-[10px] text-slate-400">For {config.childName}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                        onClick={(e) => handleDeleteConfig(config.id, e)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="text-slate-500 hover:text-slate-900"
            >
              {userApiKey ? "Key Set" : "Set API Key"}
            </Button>
            <Button 
              disabled={!coverPage?.imageUrl || pages.some(p => !p.imageUrl)}
              onClick={handleDownloadPDF}
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6"
            >
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls & Chat */}
        <div className="lg:col-span-4 space-y-6">
          {/* API Key Input (Conditional) */}
          <AnimatePresence>
            {showApiKeyInput && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      Image Generation API Key
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                        setShowApiKeyInput(false);
                        if (userApiKey) toast.success("API Key saved locally.");
                      }}>
                        <X size={14} />
                      </Button>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Required for high-quality image generation (Gemini 3 Pro Image).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input 
                      type="password" 
                      placeholder="Enter your Gemini API Key" 
                      value={userApiKey}
                      onChange={(e) => setUserApiKey(e.target.value)}
                      className="bg-white border-orange-200"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generator Form */}
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <div className="h-1 bg-orange-500 w-full" />
            <CardHeader>
              <CardTitle className="text-lg">Create a New Book</CardTitle>
              <CardDescription>Enter details to generate your coloring book.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="childName" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Child's Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    id="childName" 
                    placeholder="e.g. Leo" 
                    className="pl-10" 
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Theme</Label>
                <div className="relative">
                  <TypeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    id="theme" 
                    placeholder="e.g. Space Dinosaurs" 
                    className="pl-10" 
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  />
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="settings" className="border-none">
                  <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:no-underline py-2">
                    Advanced Settings
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-semibold text-slate-600">Image Quality</Label>
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">{imageSize}</Badge>
                      </div>
                      <Tabs defaultValue="1K" onValueChange={(v) => setImageSize(v as any)}>
                        <TabsList className="grid grid-cols-3 w-full">
                          <TabsTrigger value="1K">1K</TabsTrigger>
                          <TabsTrigger value="2K">2K</TabsTrigger>
                          <TabsTrigger value="4K">4K</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-semibold text-slate-600">Parental Controls</Label>
                          <p className="text-[10px] text-slate-400">Adjust safety filters</p>
                        </div>
                        <Shield size={16} className="text-slate-400" />
                      </div>
                      
                      {Object.entries(safetySettings).map(([key, val]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-[10px] uppercase tracking-tighter text-slate-500">
                            <span>{key}</span>
                            <span>{getSafetyLabel(val as HarmBlockThreshold)}</span>
                          </div>
                          <Slider 
                            value={[val as number]} 
                            max={3} 
                            step={1} 
                            onValueChange={(vals) => {
                              const v = vals[0];
                              setSafetySettings(prev => ({ ...prev, [key]: v }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" 
                onClick={handleGeneratePrompts}
                disabled={isGeneratingPrompts || !childName || !theme}
              >
                {isGeneratingPrompts ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning Scenes...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate Book Plan</>
                )}
              </Button>
              <Tooltip>
                <TooltipTrigger render={
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => saveConfig(childName, theme)}
                    disabled={!childName || !theme}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Heart size={18} className={savedConfigs.some(c => c.theme === theme && c.childName === childName) ? "fill-orange-500 text-orange-500" : ""} />
                  </Button>
                } />
                <TooltipContent>Save to Favorites</TooltipContent>
              </Tooltip>
            </CardFooter>
          </Card>

          {/* Chat Assistant */}
          <Card className="shadow-sm border-slate-200 flex flex-col h-[400px]">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Idea Assistant
              </CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="search-toggle" className="text-[10px] text-slate-400 uppercase font-bold">Search</Label>
                <Switch 
                  id="search-toggle" 
                  checked={useSearch} 
                  onCheckedChange={setUseSearch}
                  className="scale-75"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-4 py-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-sm text-slate-500 italic">"Need ideas? Ask me for a theme!"</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {["Underwater Kingdom", "Robot Garden", "Jungle Safari"].map(t => (
                          <Button key={t} variant="outline" size="sm" className="text-xs rounded-full" onClick={() => setTheme(t)}>
                            {t}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-none' 
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        {msg.parts[0].text}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start items-center gap-2">
                      <div className="bg-slate-100 rounded-2xl px-4 py-2 rounded-tl-none">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      </div>
                      {useSearch && (
                        <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100 animate-pulse">
                          <Search size={10} className="mr-1" /> Searching Google...
                        </Badge>
                      )}
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t">
              <div className="flex w-full gap-2">
                <Input 
                  placeholder="Ask for ideas..." 
                  className="flex-1"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button size="icon" onClick={handleSendMessage} disabled={isChatLoading}>
                  <Send size={18} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Preview & Generation */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Stepper */}
          <AnimatePresence>
            {currentStep !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="border-slate-200 bg-white shadow-sm mb-6">
                  <CardContent className="py-6">
                    <div className="flex justify-between mb-4">
                      {[
                        { id: 'brainstorming', label: 'Brainstorming', icon: Sparkles },
                        { id: 'sketching', label: 'Sketching', icon: Palette },
                        { id: 'upscaling', label: 'Upscaling', icon: RefreshCw },
                        { id: 'binding', label: 'Binding PDF', icon: Download },
                      ].map((step, i) => {
                        const Icon = step.icon;
                        const isCompleted = i < ['brainstorming', 'sketching', 'upscaling', 'binding'].indexOf(currentStep) || currentStep === 'binding';
                        const isActive = currentStep === step.id;
                        
                        return (
                          <div key={step.id} className="flex flex-col items-center gap-2 flex-1 relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                              isCompleted ? 'bg-green-500 text-white' : 
                              isActive ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              isActive ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                            }`}>
                              {step.label}
                            </span>
                            {i < 3 && (
                              <div className="absolute top-4 left-[50%] w-full h-[2px] bg-slate-100 -z-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!coverPage && pages.length === 0 ? (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <ImageIcon size={40} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">No Book Generated Yet</h3>
                <p className="text-slate-500 max-w-md mx-auto">Fill out the form on the left to start creating your personalized coloring book.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Book Preview</h2>
                  <p className="text-sm text-slate-500">Theme: <span className="text-orange-600 font-medium">{theme}</span> for {childName}</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleGenerateAllImages}
                  disabled={pages.every(p => p.status === 'generating' || p.status === 'completed')}
                  className="rounded-full"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${currentStep === 'sketching' ? 'animate-spin' : ''}`} /> 
                  {currentStep === 'sketching' ? 'Generating Art...' : 'Generate All Images'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cover Page Card */}
                {coverPage && (
                  <Card className="overflow-hidden border-slate-200 shadow-sm group">
                    <div className="aspect-square bg-slate-100 relative overflow-hidden">
                      {coverPage.imageUrl ? (
                        <img src={coverPage.imageUrl} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          {coverPage.status === 'generating' ? (
                            <div className="space-y-4 w-full px-8">
                              <Skeleton className="h-4 w-3/4 mx-auto" />
                              <Skeleton className="h-40 w-full rounded-xl" />
                              <Skeleton className="h-4 w-1/2 mx-auto" />
                              <p className="text-xs text-slate-400 animate-pulse">Sketching cover art...</p>
                            </div>
                          ) : (
                            <>
                              <ImageIcon size={48} className="text-slate-300 mb-4" />
                              <p className="text-sm font-medium text-slate-500 mb-4">Cover Page Ready</p>
                              <Button size="sm" variant="secondary" onClick={() => handleGenerateImage('cover')}>
                                Generate Image
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-slate-900/80 backdrop-blur-sm">Cover Page</Badge>
                      </div>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{coverPage.title}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">{coverPage.description}</CardDescription>
                    </CardHeader>
                  </Card>
                )}

                {/* Coloring Pages */}
                {pages.map((page, index) => (
                  <Card key={page.id} className="overflow-hidden border-slate-200 shadow-sm">
                    <div className="aspect-square bg-slate-100 relative overflow-hidden">
                      {page.imageUrl ? (
                        <img src={page.imageUrl} alt={page.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          {page.status === 'generating' ? (
                            <div className="space-y-4 w-full px-8">
                              <Skeleton className="h-4 w-3/4 mx-auto" />
                              <Skeleton className="h-40 w-full rounded-xl" />
                              <Skeleton className="h-4 w-1/2 mx-auto" />
                              <p className="text-xs text-slate-400 animate-pulse">Drawing page {index + 1}...</p>
                            </div>
                          ) : (
                            <>
                              <ImageIcon size={48} className="text-slate-300 mb-4" />
                              <p className="text-sm font-medium text-slate-500 mb-4">Page {index + 1} Ready</p>
                              <Button size="sm" variant="secondary" onClick={() => handleGenerateImage(index)}>
                                Generate Image
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">Page {index + 1}</Badge>
                        {page.difficulty && (
                          <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-100 text-[10px] uppercase">
                            {page.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{page.title}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">{page.prompt}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 opacity-50">
            <Palette size={20} />
            <span className="font-bold">ColorJoy AI</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 ColorJoy. All rights reserved. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
}
