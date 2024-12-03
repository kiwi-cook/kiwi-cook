import os

from dotenv import load_dotenv
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

load_dotenv()

# Define the service name resource for the tracer.
resource = Resource(attributes={
    SERVICE_NAME: "KiwiCook"
})

# Create a TracerProvider with the defined resource for creating tracers.
provider = TracerProvider(resource=resource)

AXIOM_API_KEY = os.getenv("AXIOM_API_KEY")

# Configure the OTLP/HTTP Span Exporter with Axiom headers and endpoint. Replace `API_TOKEN` with your Axiom API key, and replace `DATASET_NAME` with the name of the Axiom dataset where you want to send data.
otlp_exporter = OTLPSpanExporter(
    endpoint="https://api.axiom.co/v1/traces",
    headers={
        "Authorization": "Bearer " + AXIOM_API_KEY,
        "X-Axiom-Dataset": "kiwicook",
    }
)

# Create a BatchSpanProcessor with the OTLP exporter to batch and send trace spans.
processor = BatchSpanProcessor(otlp_exporter)
provider.add_span_processor(processor)

# Set the TracerProvider as the global tracer provider.
trace.set_tracer_provider(provider)

# Define a tracer for external use in different parts of the app.
service_tracer = trace.get_tracer("KiwiCookService")
