import {
  Cloud,
  FileSearch,
  Github,
  Mail,
  Loader2,
  MapPin,
  Send,
  Wind,
  Droplets,
  Sun,
  CloudRain,
  Snowflake,
  CloudLightning,
  CloudCog,
} from 'lucide-react';
import type { ToolMessage } from '@langchain/langgraph-sdk';
import type {
  ToolCallWithResult,
  ToolCallFromTool,
  ToolCallState,
  InferAgentToolCalls,
} from '@langchain/langgraph-sdk/react';
import type {
  emailAgent as EmailToolCallingAgent,
  searchCurriculum,
  sendEmail,
} from '../agents/emailAgent';
import type {
  askPlannerSpecialist,
  askWeatherSpecialist,
  emailTripPlan,
  travelAgent as TravelToolCallingAgent,
} from '../agents/travelAgent';
import type {
  createGithubIssue,
  githubIssuesAgent as GithubIssuesToolCallingAgent,
  searchGithubIssues,
} from '../agents/githubIssuesAgent';
import type {
  getWeather,
  weatherAgent as WeatherToolCallingAgent,
} from '../agents/weatherAgent';

/**
 * Helper type to filter out tool calls with generic `name: string`.
 * Keeps only tool calls where the name is a literal type (e.g., "get_weather").
 * This ensures discriminated union narrowing works correctly.
 */
type WithLiteralName<T> = T extends { name: infer N }
  ? string extends N
    ? never // Exclude if name is generic `string`
    : T
  : never;

/**
 * Define the possible tool call types this component can handle.
 */
export type AgentToolCalls = WithLiteralName<
  /**
   * Infer tool call from the getWeather tool
   */
  | ToolCallFromTool<typeof getWeather>
  /**
   * Infer tool call from the sendEmail tool
   */
  | ToolCallFromTool<typeof sendEmail>
  /**
   * Infer tool call from travel subagent tools
   */
  | ToolCallFromTool<typeof askWeatherSpecialist>
  | ToolCallFromTool<typeof askPlannerSpecialist>
  | ToolCallFromTool<typeof emailTripPlan>
  | ToolCallFromTool<typeof searchGithubIssues>
  | ToolCallFromTool<typeof createGithubIssue>
  /**
   * Infer tool call from the searchCurriculum tool
   */
  | ToolCallFromTool<typeof searchCurriculum>
  /**
   * Infer tool call from weather agent instance
   */
  | InferAgentToolCalls<typeof WeatherToolCallingAgent>
  /**
   * Infer tool call from email agent instance
   */
  | InferAgentToolCalls<typeof EmailToolCallingAgent>
  /**
   * Infer tool call from travel agent instance
   */
  | InferAgentToolCalls<typeof TravelToolCallingAgent>
  /**
   * Infer tool call from GitHub issues agent instance
   */
  | InferAgentToolCalls<typeof GithubIssuesToolCallingAgent>
>;

/**
 * Helper to parse tool result safely
 * @param result - The result of the tool call
 * @returns { status: string; content: string } - The parsed result
 */
function parseToolResult(result?: ToolMessage): {
  status: string;
  content: string;
} {
  if (!result) return { status: 'pending', content: '' };
  try {
    return JSON.parse(result.content as string);
  } catch {
    return { status: 'success', content: result.content as string };
  }
}

/**
 * Component that renders a tool call with its result.
 * Demonstrates type-safe tool call handling with discriminated unions.
 */
export function ToolCallCard({
  toolCall,
}: {
  toolCall: ToolCallWithResult<AgentToolCalls>;
}) {
  const { call, result, state } = toolCall;

  if (call.name === 'send_email') {
    return <EmailToolCallCard call={call} result={result} state={state} />;
  }

  if (call.name === 'search_curriculum') {
    return <CvSearchToolCallCard call={call} result={result} state={state} />;
  }

  if (
    call.name === 'ask_weather_specialist' ||
    call.name === 'ask_planner_specialist' ||
    call.name === 'email_trip_plan'
  ) {
    return <TravelToolCallCard call={call} result={result} state={state} />;
  }

  if (
    call.name === 'search_github_issues' ||
    call.name === 'create_github_issue'
  ) {
    return (
      <GithubIssueToolCallCard call={call} result={result} state={state} />
    );
  }

  return <WeatherToolCallCard call={call} result={result} state={state} />;
}

function TravelToolCallCard({
  call,
  result,
  state,
}: {
  call:
    | ToolCallFromTool<typeof askWeatherSpecialist>
    | ToolCallFromTool<typeof askPlannerSpecialist>
    | ToolCallFromTool<typeof emailTripPlan>;
  result?: ToolMessage;
  state: ToolCallState;
}) {
  const isLoading = state === 'pending';
  const parsedResult = parseToolResult(result);
  const isError = parsedResult.status === 'error';

  const labelByTool: Record<typeof call.name, string> = {
    ask_weather_specialist: 'Subagente clima',
    ask_planner_specialist: 'Subagente planner',
    email_trip_plan: 'Subagente email',
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-fade-in">
      <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
        <MapPin className="h-4 w-4 text-slate-700" />
        <span className="font-medium text-slate-700">
          {labelByTool[call.name]}
        </span>
        {isLoading && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin" />}
      </div>

      <p className="text-sm text-slate-600 break-words">
        <span className="font-medium text-slate-800">Tool:</span> {call.name}
      </p>

      {parsedResult.content && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            isError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          <span>{parsedResult.content}</span>
        </div>
      )}
    </div>
  );
}

function GithubIssueToolCallCard({
  call,
  result,
  state,
}: {
  call:
    | ToolCallFromTool<typeof searchGithubIssues>
    | ToolCallFromTool<typeof createGithubIssue>;
  result?: ToolMessage;
  state: ToolCallState;
}) {
  const isLoading = state === 'pending';
  const parsedResult = parseToolResult(result);
  const isError = parsedResult.status === 'error';

  const label =
    call.name === 'search_github_issues'
      ? 'Busqueda de issues'
      : 'Creacion de issue';

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-fade-in">
      <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
        <Github className="h-4 w-4 text-slate-700" />
        <span className="font-medium text-slate-700">{label}</span>
        {isLoading && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin" />}
      </div>

      <p className="text-sm text-slate-600 break-words">
        <span className="font-medium text-slate-800">Tool:</span> {call.name}
      </p>

      {parsedResult.content && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            isError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          <span>{parsedResult.content}</span>
        </div>
      )}
    </div>
  );
}

function CvSearchToolCallCard({
  call,
  result,
  state,
}: {
  call: ToolCallFromTool<typeof searchCurriculum>;
  result?: ToolMessage;
  state: ToolCallState;
}) {
  const isLoading = state === 'pending';
  const parsedResult = parseToolResult(result);
  const isError = parsedResult.status === 'error';
  const isNotFound = parsedResult.status === 'not_found';

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-fade-in">
      <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
        <FileSearch className="h-4 w-4 text-slate-700" />
        <span className="font-medium text-slate-700">Busqueda en CV</span>
        {isLoading && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin" />}
      </div>

      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-800">Pregunta:</span>{' '}
        {call.args.question}
      </p>

      {parsedResult.content && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            isError
              ? 'border-red-200 bg-red-50 text-red-700'
              : isNotFound
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          <span>{parsedResult.content}</span>
        </div>
      )}
    </div>
  );
}

function EmailToolCallCard({
  call,
  result,
  state,
}: {
  call: ToolCallFromTool<typeof sendEmail>;
  result?: ToolMessage;
  state: ToolCallState;
}) {
  const isLoading = state === 'pending';
  const parsedResult = parseToolResult(result);
  const isError = parsedResult.status === 'error';

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-fade-in">
      <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
        <Mail className="h-4 w-4 text-slate-700" />
        <span className="font-medium text-slate-700">Envio de email</span>
        {isLoading && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin" />}
      </div>

      <div className="grid gap-1 text-sm">
        <p className="text-slate-600">
          <span className="font-medium text-slate-800">Motivo:</span> Pregunta
          sin respuesta en el CV
        </p>
        <p className="text-slate-600">
          <span className="font-medium text-slate-800">Pregunta:</span>{' '}
          {call.args.question}
        </p>
      </div>

      {parsedResult.content && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            isError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {!isError && <Send className="h-4 w-4" />}
            <span>{parsedResult.content}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Parse weather content string into structured data
 */
function parseWeatherContent(content: string): {
  location: string;
  condition: string;
  temperature: string;
  wind: string;
  humidity: string;
} | null {
  // Pattern: "Weather in City, Country: Condition, Temp°C, Wind: X km/h, Humidity: Y%"
  const match = content.match(
    /Weather in ([^:]+): ([^,]+), ([^,]+), Wind: ([^,]+), Humidity: (.+)/,
  );
  if (!match) return null;
  return {
    location: match[1],
    condition: match[2],
    temperature: match[3],
    wind: match[4],
    humidity: match[5],
  };
}

/**
 * Get weather icon based on condition
 */
function getWeatherIcon(condition: string) {
  const c = condition.toLowerCase();
  console.log('Condition for icon:', c);
  if (
    c.includes('lluvia') ||
    c.includes('llovizna') ||
    c.includes('chubasco')
  ) {
    return <CloudRain className="w-8 h-8 text-sky-300" />;
  }
  if (c.includes('nieve')) {
    return <Snowflake className="w-8 h-8 text-blue-200" />;
  }
  if (c.includes('tormenta')) {
    return <CloudLightning className="w-8 h-8 text-yellow-300" />;
  }
  if (c.includes('nublado') || c.includes('niebla')) {
    return <Cloud className="w-8 h-8 text-neutral-300" />;
  }
  if (c.includes('cielo')) {
    return <CloudCog className="w-8 h-8 text-amber-300" />;
  }
  return <Sun className="w-8 h-8 text-amber-300" />;
}

/**
 * Weather tool call card - Weather station style with live data display
 */
function WeatherToolCallCard({
  call,
  result,
  state,
}: {
  call: ToolCallFromTool<typeof getWeather>;
  result?: ToolMessage;
  state: ToolCallState;
}) {
  const isLoading = state === 'pending';
  const parsedResult = parseToolResult(result);
  const isError = parsedResult.status === 'error';
  const weather = !isError ? parseWeatherContent(parsedResult.content) : null;

  return (
    <div className="relative overflow-hidden rounded-xl animate-fade-in">
      {/* Sky gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-sky-600 via-sky-500 to-indigo-600" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_50%)]" />

      <div className="relative p-4">
        {/* Location header */}
        <div className="flex items-center gap-2 text-white/80 text-xs mb-3">
          <MapPin className="w-3 h-3" />
          <span className="font-medium">{call.args.location}</span>
          {isLoading && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
        </div>

        {isError ? (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-3 text-red-200 text-sm border border-red-400/30">
            {parsedResult.content}
          </div>
        ) : weather ? (
          <div className="flex items-start justify-between">
            {/* Left: Icon and condition */}
            <div className="flex flex-col items-start">
              {getWeatherIcon(weather.condition)}
              <span className="text-white/90 text-xs mt-1 font-medium">
                {weather.condition}
              </span>
            </div>

            {/* Right: Temperature */}
            <div className="text-right">
              <div className="text-4xl font-light text-white tracking-tight">
                {weather.temperature}
              </div>
              {/* Stats row */}
              <div className="flex gap-3 mt-2 text-white/70 text-xs">
                <div className="flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  <span>{weather.wind}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  <span>{weather.humidity}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4">
            <div className="flex flex-col items-center gap-2 text-white/60">
              <Cloud className="w-8 h-8 animate-pulse" />
              <span className="text-xs">Fetching weather...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
